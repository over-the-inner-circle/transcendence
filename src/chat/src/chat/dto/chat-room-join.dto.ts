import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { IChatRoomUser } from '../interfaces/chat-room-user.interface';

export class ChatRoomJoinDto implements IChatRoomUser {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  user_id: string;

  @Expose()
  @IsString()
  room_password: string;
}
