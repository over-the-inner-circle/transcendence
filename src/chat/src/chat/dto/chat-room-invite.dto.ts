import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { IChatRoomUser } from '../interfaces/chat-room-user.interface';

export class ChatRoomInviteDto implements IChatRoomUser {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  @IsUUID()
  user_id: string;

  @Expose()
  @IsUUID()
  receiver_id: string;
}
