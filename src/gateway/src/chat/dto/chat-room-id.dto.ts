import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class ChatRoomIdDto {
  @Expose()
  @IsUUID()
  room_id: string;
}
