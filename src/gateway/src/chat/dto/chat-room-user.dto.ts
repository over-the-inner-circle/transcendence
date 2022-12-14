import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class ChatRoomUserDto {
  room_id: string;
  user_id: string;
}
