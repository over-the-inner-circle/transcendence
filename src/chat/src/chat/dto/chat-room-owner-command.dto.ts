import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ChatRoomOwnerPrivilege } from '../interfaces/chat-room-owner-privilege.interface';

export class ChatRoomOwnerCommandDto implements ChatRoomOwnerPrivilege {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  room_owner_id: string;
}
