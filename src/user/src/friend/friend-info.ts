import { Expose } from 'class-transformer';

export class FriendInfo {
  friend_id: string;
  requester: string;
  receiver: string;
  created: string;
}

export class RequestInfo {
  @Expose()
  request_id: string;
  requester: string;
  receiver: string;
  @Expose()
  created: string;
}
