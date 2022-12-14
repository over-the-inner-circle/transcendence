import { Expose } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';
import { ChatRoomAccess } from '../types/chat-room-access';

export class ChatRoomAccessibilityDto {
  room_id: string;
  room_owner_id: string;

  @Expose()
  @IsEnum(ChatRoomAccess)
  room_access: ChatRoomAccess;
}
