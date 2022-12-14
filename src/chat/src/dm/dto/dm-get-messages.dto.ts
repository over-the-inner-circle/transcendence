import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class DmGetMessagesDto {
  @Expose()
  @IsUUID()
  sender_id: string;

  @Expose()
  @IsUUID()
  receiver_id: string;
}
