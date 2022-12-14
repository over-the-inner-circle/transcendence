import { IChatRoomId } from './chat-room-id.interface';

export interface IChatRoomUser extends IChatRoomId {
  room_id: string;
  user_id: string;
}
