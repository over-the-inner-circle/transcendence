import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class ChatRoomSetPasswordDto {
  room_id: string;
  room_owner_id: string;

  @Expose()
  @IsString()
  room_password: string;
}
