import { RmqEvent } from '../../common/rmq/types/rmq-event';

export type RoutingKeyParams = { evType: string; userId: string };
export interface NotificationEventCommand {
  ev: RmqEvent;
  params: RoutingKeyParams;

  execute();
}

export class FriendRequestCommand implements NotificationEventCommand {
  ev: RmqEvent;
  params: RoutingKeyParams;

  async execute() {}
}
