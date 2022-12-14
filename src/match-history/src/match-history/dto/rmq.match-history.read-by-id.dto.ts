import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class RmqMatchHistoryReadByIdDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsNumber()
  take: number;
}
