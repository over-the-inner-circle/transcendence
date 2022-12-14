import { Expose } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class ChatRoomPenaltyWithTimeDto {
  room_id: string;
  room_admin_id: string;

  @Expose()
  @IsUUID()
  user_id: string;

  @Expose()
  @IsNumber()
  time_amount_in_seconds: number;
}
