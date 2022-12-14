import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { RmqEvent } from '../../common/rmq/types/rmq-event';
import { UserService } from '../../user/services/user.service';
import { DMFromServer } from '../types/dm/dm-format';

@Injectable()
export class NotificationService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  userEventHandler(ev: RmqEvent, rk: string) {
    const re = /(?<=event.on.user.)(.*)(?=.rk)/;
    const evType = re.exec(rk)[0];

    switch (evType) {
      case 'friend-request':
        break;
      default:
        console.log('unknown event');
        return;
    }

    for (const recvUser of ev.recvUsers) {
      const userRk = `event.on.notification.user:${evType}.${recvUser}.rk`;
      const event = new RmqEvent(ev.data, [recvUser]);

      this.amqpConnection.publish(
        process.env.RMQ_NOTIFICATION_TOPIC,
        userRk,
        event,
      );
    }
  }

  async dmEventHandler(ev: RmqEvent<DMFromServer>, rk: string) {
    const re = /(?<=event.on.dm.)(.*)(?=.rk)/;
    const parsed = re.exec(rk)[0].split('.');
    const params = { evType: parsed[0], dmRoomName: parsed[1] };

    console.error(ev, rk);
    switch (params.evType) {
      case 'message':
        break;
      default:
        console.log('unknown event');
        return;
    }

    for (const recvUser of ev.recvUsers) {
      const userRk = `event.on.notification.dm:${params.evType}.${recvUser}.rk`;
      const event = new RmqEvent(ev.data, [recvUser]);

      this.amqpConnection.publish(
        process.env.RMQ_NOTIFICATION_TOPIC,
        userRk,
        event,
      );
    }
  }

  chatEventHandler(ev: RmqEvent, rk: string) {
    const re = /(?<=event.on.chat.)(.*)(?=.rk)/;
    const parsed = re.exec(rk)[0].split('.');
    const params = { evType: parsed[0], dmRoomName: parsed[1] };

    switch (params.evType) {
      case 'invitation':
        break;
      default:
        console.log('unknown event');
        return;
    }

    for (const recvUser of ev.recvUsers) {
      const userRk = `event.on.notification.chat:${params.evType}.${recvUser}.rk`;
      const event = new RmqEvent(ev.data, [recvUser]);

      this.amqpConnection.publish(
        process.env.RMQ_NOTIFICATION_TOPIC,
        userRk,
        event,
      );
    }
  }

  gameEventHandler(ev: RmqEvent, rk: string) {
    const re = /(?<=event.on.game.)(.*)(?=.rk)/;
    const parsed = re.exec(rk)[0].split('.');
    const params = { evType: parsed[0], dmRoomName: parsed[1] };

    switch (params.evType) {
      case 'invitation':
        break;
      default:
        console.log('unknown event');
        return;
    }

    for (const recvUser of ev.recvUsers) {
      const userRk = `event.on.notification.game:${params.evType}.${recvUser}.rk`;
      const event = new RmqEvent(ev.data, [recvUser]);

      this.amqpConnection.publish(
        process.env.RMQ_NOTIFICATION_TOPIC,
        userRk,
        event,
      );
    }
  }
}
