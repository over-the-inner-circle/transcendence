import { Expose } from 'class-transformer';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ChatRoomAccess } from '../../common/entities/chat-room.entity';

export class ChatRoomCreationDto {
  @Expose()
  @IsString()
  room_name: string;

  @Expose()
  @IsUUID()
  room_owner_id: string;

  @Expose()
  @IsEnum(ChatRoomAccess)
  room_access: ChatRoomAccess;

  @Expose()
  @IsString()
  room_password: string;
}
