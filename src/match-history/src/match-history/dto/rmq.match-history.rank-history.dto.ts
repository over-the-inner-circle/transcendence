import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class RmqMatchHistoryRankHistoryDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  game_id: string;

  @IsNotEmpty()
  @IsNumber()
  delta: number;
}
