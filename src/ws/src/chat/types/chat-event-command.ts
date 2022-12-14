import { RmqEvent } from '../../common/rmq/types/rmq-event';
import { ChatGateway } from '../chat.gateway';
import {
  ChatAnnouncementFromServer,
  ChatPayloadFormat,
  ChatMessageFromServer,
  ChatRoomMessageFormat,
} from './chat-message-format';

export type RoutingKeyParams = { evType: string; roomId: string };
export interface EventCommand {
  ev: RmqEvent<ChatPayloadFormat | ChatRoomMessageFormat>;
  params: RoutingKeyParams;

  execute(chatGateway: ChatGateway);
}

export class BanCommand implements EventCommand {
  ev: RmqEvent<ChatAnnouncementFromServer>;
  params: RoutingKeyParams;
  constructor(ev: RmqEvent, params: RoutingKeyParams) {
    this.ev = ev;
    this.params = params;
  }
  async execute(chatGateway: ChatGateway) {
    const userId = this.ev.recvUsers[0];
    const sockId = await chatGateway.getConnSocketId(userId);
    const clientSocket = chatGateway.getClientSocket(sockId);
    if (clientSocket) {
      chatGateway.announce(clientSocket, this.ev.data);
      clientSocket.leave(this.params.roomId);
      clientSocket.disconnect(true);
    }
  }
}

export class AnnouncementCommand implements EventCommand {
  ev: RmqEvent;
  params: RoutingKeyParams;
  constructor(ev: RmqEvent, params: RoutingKeyParams) {
    this.ev = ev;
    this.params = params;
  }
  async execute(chatGateway: ChatGateway) {
    chatGateway.announce(
      chatGateway.getServer().in(this.params.roomId),
      new ChatAnnouncementFromServer(this.ev.data),
    );
  }
}

export class MessageCommand implements EventCommand {
  ev: RmqEvent<ChatMessageFromServer>;
  params: RoutingKeyParams;
  constructor(ev: RmqEvent, params: RoutingKeyParams) {
    this.ev = ev;
    this.params = params;
  }
  async execute(chatGateway: ChatGateway) {
    const clientSockets: any[] = await chatGateway
      .getServer()
      .in(this.params.roomId)
      .fetchSockets();

    /* handle room message from other instances */
    const senderId = this.ev.data.sender.user_id;
    for (const clientSocket of clientSockets) {
      const receiverId = (await chatGateway.getUser(clientSocket)).user_id;

      if (await chatGateway.isBlocked(receiverId, senderId)) continue;

      const emit =
        receiverId === senderId
          ? chatGateway.echoMessage
          : chatGateway.sendMessage;
      emit(clientSocket, this.ev.data);
    }
  }
}

export class CommandFactory {
  getCommand(ev: RmqEvent, params: RoutingKeyParams): EventCommand {
    switch (params.evType) {
      case 'message':
        return new MessageCommand(ev, params);
      case 'announcement':
        return new AnnouncementCommand(ev, params);
      case 'ban':
      case 'kick':
        return new BanCommand(ev, params);
      default:
        return null;
    }
  }
}
