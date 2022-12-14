import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DmDto {
  @Expose()
  @IsUUID()
  sender_id: string;

  @Expose()
  @IsUUID()
  receiver_id: string;

  @Expose()
  @IsString()
  payload: string;

  @IsOptional()
  created: string;
}
