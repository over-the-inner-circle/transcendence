import { UserProfile } from '../../user/types/user-profile';

export interface ChatRoomMessage {
  room_msg_id: string;
  room_id: string;
  sender_id: string;
  payload: string;
  created: Date;
}

export interface ChatPayloadFormat {
  payload: string;
}

export interface ChatRoomMessageFormat {
  message: {
    room_msg_id: string;
    room_id: string;
    sender_id: string;
    payload: string;
    created: Date;
  };
}

export class ChatPayloadFromClient implements ChatPayloadFormat {
  room: string;
  payload: string;
}

export class ChatMessageFromServer implements ChatRoomMessageFormat {
  constructor(
    readonly sender: UserProfile,
    readonly message: ChatRoomMessage,
  ) {}
}

export class ChatAnnouncementFromServer implements ChatPayloadFormat {
  constructor(readonly payload: string) {}
}
