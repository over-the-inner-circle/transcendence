import { Expose } from 'class-transformer';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ChatRoomAccess } from '../types/chat-room-access';

export class ChatRoomCreationDto {
  room_owner_id: string;

  @Expose()
  @IsString()
  room_name: string;

  @Expose()
  @IsEnum(ChatRoomAccess)
  room_access: ChatRoomAccess;

  @Expose()
  @IsString()
  room_password: string;
}
