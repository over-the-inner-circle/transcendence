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
import { UserService } from '../user/services/user.service';
import { v4 } from 'uuid';

@UseFilters(new WsExceptionsFilter())
@WebSocketGateway(9994, { cors: true })
export class StateGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private serverId: string;

  constructor(
    private readonly authService: AuthService,
    private readonly amqpConnection: AmqpConnection,
    private readonly userService: UserService,
  ) {
    this.serverId = v4();
  }

  //@======================================================================@//
  //@                             Connection                               @//
  //@======================================================================@//
  async afterInit(server: Server) {
    /* when last user of dm-room on this ws-instance exit, delete room-queue */
    server.of('/').adapter.on('delete-room', async (subjectRoom: string) => {
      const subjectId = subjectRoom.replace('state-', '');
      try {
        await this.amqpConnection.channel.deleteQueue(this.subjectQ(subjectId));
      } catch (e) {
        console.log(`Failed to delete ${this.subjectQ(subjectId)}`);
      }
    });
  }

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

    //BUG: unhandled rejection - Exception filter does not catch?!
    const friends = await this.userService
      .getFriends(user.user_id)
      .catch((e) => console.log(e));
    if (!friends) return;

    const subjects = friends.map((friend) => {
      return friend.user_id;
    });

    clientSocket['consumer_tags'] = [];

    /* only one consumer(handler) per subject-queue */
    for (const subject of subjects) {
      /* observers' room */
      try {
        await clientSocket.join(`state-${subject}`);
      } catch (e) {
        console.log(e);
      }

      /* queue per subject */
      const res = await this.amqpConnection.channel.assertQueue(
        this.subjectQ(subject),
        {
          autoDelete: true /* delete if no handler */,
        },
      );
      if (res.consumerCount) continue;

      const result = await this.amqpConnection
        .createSubscriber(
          (ev: RmqEvent, rawMsg) => this.stateEventHandler(ev, rawMsg),
          {
            exchange: process.env.RMQ_STATE_TOPIC,
            queue: this.subjectQ(subject),
            routingKey: [this.subjectRK('update', subject)],
            errorHandler: (c, m, e) => console.error(e),
            queueOptions: {
              autoDelete: true,
            },
          },
          'stateEventHandler',
        )
        .catch((e) => console.log(e));
      if (!result) return;

      clientSocket['consumer_tags'].push(result.consumerTag);
    }
  }

  async handleDisconnect(@ConnectedSocket() clientSocket: Socket) {
    if (!clientSocket['consumer_tags']) return;
    for (const consumerTag of clientSocket['consumer_tags'])
      await this.amqpConnection
        .cancelConsumer(consumerTag)
        .catch((e) => console.log(e));

    /* NOTE: disconnect 되자마자 다시 connect하면, 아직 consumer가 다 안지워질수도..?! */
  }

  //'======================================================================'//
  //'                           RabbitMQ handler                           '//
  //'======================================================================'//

  async stateEventHandler(ev: RmqEvent, rawMsg: ConsumeMessage) {
    const re = /(?<=event.on.state.)(.*)(?=.rk)/;
    const params = re.exec(rawMsg.fields.routingKey)[0].split('.');

    const { 0: evType, 1: subject } = params;

    switch (evType) {
      case 'update':
        this.server
          .in(`state-${subject}`)
          .emit('update', { user: subject, state: ev.data });
        break;
      default:
        console.log('unknown event');
    }
  }

  //#======================================================================#//
  //#                                ETC                                   #//
  //#======================================================================#//

  stateTX() {
    return process.env.RMQ_STATE_TOPIC;
  }

  subjectRK(evType: string, subUserId: string) {
    return `event.on.state.${evType}.${subUserId}.rk`;
  }

  subjectQ(subUserId: string) {
    return `state.subject.${subUserId}.${this.serverId}.q`;
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
