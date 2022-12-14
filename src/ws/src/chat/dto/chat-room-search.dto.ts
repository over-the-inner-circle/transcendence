import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ChatRoomSearchDto {
  room_name: string;
}
