import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export enum GameMode {
  RANK = 'rank',
  FRIENDLY = 'friendly',
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
}
export class RmqRequestMatchHistoryGameInfoDto {
  @IsNotEmpty()
  @IsUUID()
  l_player_id: string;

  @IsNotEmpty()
  @IsUUID()
  r_player_id: string;

  @IsNotEmpty()
  @IsString()
  difficulty: Difficulty;

  @IsNotEmpty()
  @IsString()
  mode: GameMode;
}
