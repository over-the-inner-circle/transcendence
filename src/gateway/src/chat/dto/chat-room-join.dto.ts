import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class ChatRoomJoinDto {
  room_id: string;
  user_id: string;

  @Expose()
  @IsString()
  room_password: string;
}
