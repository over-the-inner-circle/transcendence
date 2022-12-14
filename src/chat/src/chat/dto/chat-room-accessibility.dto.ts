import { Expose } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';
import { ChatRoomAccess } from '../../common/entities/chat-room.entity';

export class ChatRoomAccessibilityDto {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  room_owner_id: string;

  @Expose()
  @IsEnum(ChatRoomAccess)
  room_access: ChatRoomAccess;
}
