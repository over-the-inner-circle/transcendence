import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ChatRoomAdminPrivilege } from '../interfaces/chat-room-admin-privilege.interface';

export class ChatRoomAdminCommandDto implements ChatRoomAdminPrivilege {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  room_admin_id: string;
}
