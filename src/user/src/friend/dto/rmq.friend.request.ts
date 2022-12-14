import { IsNotEmpty, IsUUID } from 'class-validator';

export class RmqRequestFriend {
  @IsNotEmpty()
  @IsUUID()
  requester: string;

  @IsNotEmpty()
  @IsUUID()
  receiver: string;
}

export class RmqDeleteFriend {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  friend_id: string;
}

export class RmqCancelFriendRequest {
  @IsNotEmpty()
  @IsUUID()
  request_id: string;
  @IsNotEmpty()
  @IsUUID()
  requester: string;
}

export class RmqRejectFriendRequest {
  @IsNotEmpty()
  @IsUUID()
  request_id: string;
  @IsNotEmpty()
  @IsUUID()
  receiver: string;
}
export class RmqAcceptFriendRequest {
  @IsNotEmpty()
  @IsUUID()
  request_id: string;
  @IsNotEmpty()
  @IsUUID()
  receiver: string;
}

export class RmqUserId {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
