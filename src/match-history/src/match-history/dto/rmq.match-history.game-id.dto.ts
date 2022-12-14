import { IsNotEmpty, IsUUID } from 'class-validator';
export class RmqMatchHistoryGameIdDto {
  @IsNotEmpty()
  @IsUUID()
  game_id: string;
}
