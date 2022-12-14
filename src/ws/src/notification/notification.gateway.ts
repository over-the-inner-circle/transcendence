import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage } from 'amqplib';
import { RmqEvent } from '../common/rmq/types/rmq-event';
import { RedisService } from '../redis-module/services/redis.service';
import { AuthService } from '../auth/auth.service';
import { WsExceptionsFilter } from '../common/ws/ws-exceptions.filter';
import { UserProfile } from '../user/types/user-profile';
import { toUserProfile } from '../common/utils/utils';
import { NotificationFromUser } from './types/notifiaction-from-user';
import { UserService } from '../user/services/user.service';
import { UserState } from '../user/types/user-info';

@UseFilters(new WsExceptionsFilter())
@WebSocketGateway(1234, { cors: true })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;
  private logger = new Logger('NotificationGateway');

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  //@======================================================================@//
  //@                             Connection                               @//
  //@======================================================================@//

  @UseFilters(new WsExceptionsFilter())
  async handleConnection(
    @ConnectedSocket() clientSocket: Socket,
    ...args: any[]
  ) {
    let user: UserProfile;

    try {
      user = await this.bindUser(clientSocket);
    } catch (e) {
      clientSocket.disconnect(true);
      return;
    }

    this.logger.debug(`< ${user.user_id} > connected`);

    /* queue per user */
    const res = await this.amqpConnection.channel.assertQueue(
      this.userQ(user.user_id),
      {
        autoDelete: true /* delete if no handler */,
      },
    );

    /* only one consumer(handler) per user-queue */
    if (!res.consumerCount) {
      await this.amqpConnection
        .createSubscriber(
          (ev: RmqEvent, rawMsg) => this.ntfEventHandler(ev, rawMsg),
          {
            exchange: process.env.RMQ_NOTIFICATION_TOPIC,
            queue: this.userQ(user.user_id),
            routingKey: this.userRK(user.user_id),
            errorHandler: (c, m, e) => this.logger.error(e),
            queueOptions: {
              autoDelete: true,
            },
          },
          'ntfEventHandler',
        )
        .catch((e) => console.log(e));
    }

    /* save connected socket per user */
    await this.redisService.hsetJson(this.makeUserKey(user.user_id), {
      ntf_sock: clientSocket.id,
    });

    await this.userService.setUserState({
      user_id: user.user_id,
      state: UserState.ONLINE,
    });
  }

  async handleDisconnect(@ConnectedSocket() clientSocket: Socket) {
    const user: UserProfile = await this.getUser(clientSocket);

    if (!user) {
      clientSocket.disconnect(true);
      return;
    }

    this.logger.debug(`< ${user.user_id} > disconnected`);
    await this.userService.setUserState({
      user_id: user.user_id,
      state: UserState.OFFLINE,
    });
    await this.redisService.hdel(this.makeUserKey(user.user_id), 'ntf_sock');
    await this.amqpConnection.channel.deleteQueue(this.userQ(user.user_id));
  }

  //'======================================================================'//
  //'                           RabbitMQ handler                           '//
  //'======================================================================'//

  async ntfEventHandler(ev: RmqEvent, rawMsg: ConsumeMessage) {
    const re = /(?<=event.on.notification.)(.*)(?=.rk)/;
    const params = re.exec(rawMsg.fields.routingKey)[0].split('.');
    const { 0: evType, 1: userId } = params;
    const { 0: category, 1: type } = evType.split(':');

    const clientSock: Socket = this.getClientSocket(
      await this.redisService.hget(this.makeUserKey(userId), 'ntf_sock'),
    );
    switch (category) {
      case 'user':
      case 'chat':
      case 'game':
      case 'dm':
        if (
          await this.userService.isBlocked({
            blocker: userId,
            blocked: ev.data['sender']['user_id'],
          })
        )
          return;
        clientSock.emit(
          `notification-${category}`,
          new NotificationFromUser(type, ev.data),
        );
        break;
      default:
        console.log(`unknown event : ${evType}`);
    }
  }

  //#======================================================================#//
  //#                                ETC                                   #//
  //#======================================================================#//

  makeUserKey(user_id: string) {
    return 'user:' + user_id;
  }

  getClientSocket(clientId: string): Socket {
    return this.server.sockets.sockets.get(clientId);
  }

  async getUser(clientSocket: Socket): Promise<UserProfile> {
    return clientSocket['user_profile'];
  }

  userQ(userId: string) {
    return `notification.user.${userId}.q`;
  }

  userRK(userId: string) {
    return `event.on.notification.*.${userId}.rk`;
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
}
