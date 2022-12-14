import { Expose } from 'class-transformer';

export class DmDto {
  @Expose()
  sender_id: string;

  @Expose()
  receiver_id: string;

  @Expose()
  payload: string;
}
