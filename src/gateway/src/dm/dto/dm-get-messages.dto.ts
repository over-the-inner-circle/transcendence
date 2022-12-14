import { Expose } from 'class-transformer';

export class DmGetMessagesDto {
  @Expose()
  sender_id: string;

  @Expose()
  receiver_id: string;
}
