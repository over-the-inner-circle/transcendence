import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { ChatRoomOwnerPrivilege } from '../interfaces/chat-room-owner-privilege.interface';

export class ChatRoomSetPasswordDto implements ChatRoomOwnerPrivilege {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  room_owner_id: string;

  @Expose()
  @IsString()
  room_password: string;
}
