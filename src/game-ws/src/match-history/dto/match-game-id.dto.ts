import { IsNotEmpty, IsUUID } from 'class-validator';

export class RmqMatchHistoryGameId {
  @IsNotEmpty()
  @IsUUID()
  game_id: string;
}
