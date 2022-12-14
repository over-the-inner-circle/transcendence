import { Expose } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';
import { ChatUserRole } from '../../common/entities/chat-room-user.entity';
import { ChatRoomOwnerPrivilege } from '../interfaces/chat-room-owner-privilege.interface';
import { IChatRoomUser } from '../interfaces/chat-room-user.interface';

export class ChatUserRoleDto implements ChatRoomOwnerPrivilege, IChatRoomUser {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  room_owner_id: string;

  @Expose()
  @IsUUID()
  user_id: string;

  @Expose()
  @IsEnum(ChatUserRole)
  role: ChatUserRole;
}
