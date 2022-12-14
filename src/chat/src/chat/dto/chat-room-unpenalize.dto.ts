import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ChatRoomAdminPrivilege } from '../interfaces/chat-room-admin-privilege.interface';
import { IChatRoomUser } from '../interfaces/chat-room-user.interface';

export class ChatRoomUnpenalizeDto
  implements ChatRoomAdminPrivilege, IChatRoomUser
{
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  room_admin_id: string;

  @Expose()
  @IsUUID()
  user_id: string;
}
