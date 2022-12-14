import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class ChatRoomPenaltyDto {
  room_id: string;
  room_admin_id: string;

  @Expose()
  @IsUUID()
  user_id: string;
}
