import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class RmqRequestMatchHistoryGameResultDto {
  @IsNotEmpty()
  @IsUUID()
  game_id: string;

  @IsNotEmpty()
  @IsNumber()
  l_player_score: number;

  @IsNotEmpty()
  @IsNumber()
  r_player_score: number;

  @IsNotEmpty()
  @IsUUID()
  winner_id: string;
}
