import { RmqEvent } from '../../../common/rmq/types/rmq-event';

export interface DmEventCommand {
  event: RmqEvent;
  evType: string;
  dmRoomName: string;
  execute();
}

export class DmMessageCommand implements DmEventCommand {
  event: RmqEvent;
  evType: string;
  dmRoomName: string;

  constructor(event: RmqEvent, routingKey: string) {
    const re = /(?<=event.on.dm.)(.*)(?=.rk)/;
    const parsed = re.exec(routingKey)[0].split('.');
    this.event = event;
    this.evType = parsed[0];
    this.dmRoomName = parsed[1];
  }
  execute() {
    const users = this.dmRoomName.split(':');
    // NEED USER ID!
    for (const user of users) {
      const userRk = `event.on.notification.${this.evType}.${
        user /* it has to be user_id */
      }.rk`;
      const event = new RmqEvent(this.event.data);

      //   this.amqpConnection.publish(
      //     process.env.RMQ_NOTIFICATION_TOPIC,
      //     userRk,
      //     event,
      //   );

      /* in ntf handler, if user has dm_sock , discard event.. */
    }
  }
}
