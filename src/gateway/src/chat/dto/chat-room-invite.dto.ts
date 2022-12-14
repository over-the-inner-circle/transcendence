import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ChatRoomInviteDto {
  receiver_id: string;
  room_id: string;
  user_id: string;
}

export class ChatRoomInviteByNicknameDto {
  @Expose()
  @IsString()
  receiver_nickname: string;

  room_id: string;
  user_id: string;
}
