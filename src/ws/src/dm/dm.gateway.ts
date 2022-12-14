import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UseFilters, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { ConsumeMessage } from 'amqplib';
import { Server, Socket, BroadcastOperator } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from '../auth/auth.service';
import { RmqEvent } from '../common/rmq/types/rmq-event';
import { WsExceptionsFilter } from '../common/ws/ws-exceptions.filter';
import { RedisService } from '../redis-module/services/redis.service';
import { v4 } from 'uuid';
import { DMFormat, DMFromClient, DMFromServer } from './types/dm-format';
import { DmService } from './services/dm.service';
import { UserService } from '../user/services/user.service';
import { UserProfile } from '../user/types/user-profile';
import { toUserProfile } from '../common/utils/utils';

@UseFilters(new WsExceptionsFilter())
@WebSocketGateway(9992, { cors: true })
export class DMGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;
  private serverId: string;
  private logger = new Logger('DmGateway');

  constructor(
    private readonly authService: AuthService,
    private readonly amqpConnection: AmqpConnection,
    private readonly redisService: RedisService,
    private readonly dmService: DmService,
    private readonly userService: UserService,
  ) {
    /* gen UUID to distinguish same roomId queue at other WS */
    this.serverId = v4();
  }

  //@======================================================================@//
  //@                             Connection                               @//
  //@======================================================================@//

  async afterInit(server: Server) {
    /* when last user of dm-room on this ws-instance exit, delete room-queue */
    server.of('/').adapter.on('delete-room', async (dmRoom) => {
      try {
        await this.amqpConnection.channel.deleteQueue(this.dmRoomQ(dmRoom));
      } catch (e) {
        console.log(`Failed to delete ${this.dmRoomQ(dmRoom)}`);
      }
    });
  }

  async handleConnection(
    @ConnectedSocket() clientSocket: Socket,
    ...args: any[]
  ) {}

  async handleDisconnect(@ConnectedSocket() clientSocket: Socket) {
    const user: UserProfile = await this.getUser(clientSocket);

    if (!user) {
      clientSocket.disconnect(true);
      return;
    }
    await this.redisService.hdel(this.makeUserKey(user.user_id), 'dm_sock');
  }

  //*======================================================================*//
  //*                         socket.io message emitter                    *//
  //*======================================================================*//

  send(
    evName: string,
    socket: Socket | BroadcastOperator<DefaultEventsMap, null>,
    payload: DMFormat,
  ) {
    socket.emit(evName, payload);
  }

  sendMessage(
    socket: Socket | BroadcastOperator<DefaultEventsMap, null>,
    payload,
  ) {
    socket.emit('subscribe', payload);
  }
  echoMessage(
    socket: Socket | BroadcastOperator<DefaultEventsMap, null>,
    payload,
  ) {
    socket.emit('subscribe_self', payload);
  }

  //*======================================================================*//
  //*                        socket.io message handler                     *//
  //*======================================================================*//

  @SubscribeMessage('join')
  async joinRoom(
    @MessageBody() message,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    /* FIXME: bind user here instead of connection temporarily  */
    let user: UserProfile;
    try {
      user = await this.bindUser(clientSocket);
    } catch (e) {
      clientSocket.disconnect(true);
      return;
    }
    /* map connected socket ID with user ID */
    await this.setConnSocketId(user.user_id, clientSocket.id);
    /* FIXME */

    const oppoId = (
      await this.userService.getUserProfileByNickname(message.opponent)
    ).user_id;
    const userId = (await this.getUser(clientSocket)).user_id;
    const dmRoomName = this.makeDmRoomName(userId, oppoId);
    await clientSocket.join(dmRoomName);

    /* queue per room-event */
    const roomQueue = await this.amqpConnection.channel.assertQueue(
      this.dmRoomQ(dmRoomName),
      {
        autoDelete: true /* delete if no handler */,
      },
    );
    /* only one consumer(handler) per room */
    if (!roomQueue.consumerCount) {
      await this.amqpConnection
        .createSubscriber(
          (msg: RmqEvent, rawMsg) => this.dmEventHandler(msg, rawMsg),
          {
            exchange: this.dmTX(),
            queue: this.dmRoomQ(dmRoomName) /* subscriber */,
            routingKey: [this.dmRoomRK('message', dmRoomName)],
            errorHandler: (c, m, e) => this.logger.error(e),
            queueOptions: {
              autoDelete: true,
            },
          },
          'dmEventHandler',
        )
        .catch((e) => console.log(e));
    }
  }

  @SubscribeMessage('publish')
  async publish(
    @MessageBody() message: DMFromClient,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const sender = await this.getUser(clientSocket);
    const receiver = await this.userService.getUserProfileByNickname(
      message.opponent,
    );
    const dmRoomName = this.makeDmRoomName(sender.user_id, receiver.user_id);

    /* To Database */
    await this.dmService.storeMessage({
      sender_id: sender.user_id,
      receiver_id: receiver.user_id,
      payload: message.payload,
    });

    /* To all WS instances */
    this.amqpConnection.publish(
      this.dmTX(),
      this.dmRoomRK('message', dmRoomName),
      new RmqEvent(new DMFromServer(sender, message.payload), [
        receiver.user_id,
      ]),
    );
  }

  //'======================================================================'//
  //'                        RabbitMQ event handler                        '//
  //'======================================================================'//

  /* handler for room queue */
  async dmEventHandler(ev: RmqEvent<DMFromServer>, rawMsg: ConsumeMessage) {
    const re = /(?<=event.on.dm.)(.*)(?=.rk)/;
    const parsed = re.exec(rawMsg.fields.routingKey)[0].split('.');
    const params = { evType: parsed[0], dmRoomName: parsed[1] };

    const users = params.dmRoomName.split(':');
    const clientSockets: any[] = await this.getServer()
      .in(params.dmRoomName)
      .fetchSockets();

    /* handle dm from other instances */
    const senderId = ev.data.sender.user_id;
    for (const clientSocket of clientSockets) {
      const receiver = await this.getUser(clientSocket);
      /* only two user can get message */
      if (!users.includes(receiver.user_id)) continue; // may warn
      if (
        await this.userService.isBlocked({
          blocker: receiver.user_id,
          blocked: senderId,
        })
      )
        continue;
      const emit =
        receiver.user_id == senderId ? this.echoMessage : this.sendMessage;
      emit(clientSocket, ev.data);
    }
  }

  //#======================================================================#//
  //#                                ETC                                   #//
  //#======================================================================#//

  makeUserKey(userId: string) {
    return 'user:' + userId;
  }

  async setConnSocketId(userId: string, sockId: string) {
    await this.redisService.hsetJson(this.makeUserKey(userId), {
      dm_sock: sockId,
    });
  }
  async getConnSocketId(userId: string) {
    return this.redisService.hget(this.makeUserKey(userId), 'dm_sock');
  }

  getClientSocket(sockId: string): Socket {
    return this.server.sockets.sockets.get(sockId);
  }

  async getUser(clientSocket: Socket): Promise<UserProfile> {
    return clientSocket['user_profile'];
  }

  dmTX() {
    return process.env.RMQ_DM_TOPIC;
  }

  dmRoomQ(dmRoomId: string) {
    return `dm.${dmRoomId}.${this.serverId}.q`;
  }

  dmRoomRK(eventName: string, dmRoomId: string) {
    return `event.on.dm.${eventName}.${dmRoomId}.rk`;
  }

  makeDmRoomName(userId: string, oppoId: string) {
    return userId > oppoId ? `${userId}:${oppoId}` : `${oppoId}:${userId}`;
  }

  async bindUser(clientSocket: Socket) {
    /* get user info */
    const access_token = clientSocket.handshake.auth['access_token'];
    let payload;
    let user;
    try {
      payload = await this.authService.verifyJwt(access_token);
      user = await this.userService.getUserProfileById(payload.user_id);
    } catch (e) {
      throw new WsException(e);
    }

    /* bind user info to socket */
    clientSocket['user_profile'] = toUserProfile(user);
    return user;
  }

  getServer() {
    return this.server;
  }
}
