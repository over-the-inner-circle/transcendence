import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { IChatRoomId } from '../interfaces/chat-room-id.interface';

export class ChatRoomIdDto implements IChatRoomId {
  @Expose()
  @IsUUID()
  room_id: string;
}
