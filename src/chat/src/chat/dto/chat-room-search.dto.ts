import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ChatRoomSearchDto {
  @Expose()
  @IsString()
  room_name: string;
}
