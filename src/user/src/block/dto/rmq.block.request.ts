import { IsNotEmpty, IsUUID } from 'class-validator';

export class RmqRequestBlock {
  @IsNotEmpty()
  @IsUUID()
  blocker: string;

  @IsNotEmpty()
  @IsUUID()
  blocked: string;
}

export class RmqUserId {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}

export class RmqDeleteBlock {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  block_id: string;
}
