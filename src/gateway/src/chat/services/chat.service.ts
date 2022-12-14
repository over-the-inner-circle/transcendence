import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RmqResponse } from '../../common/rmq/types/rmq-response';
import { ChatRoomAccessibilityDto } from '../dto/chat-room-accessibility.dto';
import { ChatRoomCreationDto } from '../dto/chat-room-creation.dto';
import { ChatRoomOwnerCommandDto } from '../dto/chat-room-owner-command.dto';
import { ChatRoomJoinDto } from '../dto/chat-room-join.dto';
import { ChatRoomMessageDto } from '../dto/chat-room-message.dto';
import { ChatRoomPenaltyWithTimeDto } from '../dto/chat-room-penalty-with-time.dto';
import { ChatRoomSetPasswordDto } from '../dto/chat-room-set-password.dto';
import { ChatRoomUserDto } from '../dto/chat-room-user.dto';
import { ChatUserRoleDto } from '../dto/chat-user-role.dto';
import { ChatRoomAdminCommandDto } from '../dto/chat-room-admin-command.dto';
import { ChatRoomUnpenalizeDto } from '../dto/chat-room-unpenalize.dto';
import { ChatRoomIdDto } from '../dto/chat-room-id.dto';
import { ChatRoomInviteDto } from '../dto/chat-room-invite.dto';
import { ChatRoomPenaltyDto } from '../dto/chat-room-penalty.dto';

@Injectable()
export class ChatService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  RK(type: 'req' | 'event', name: string) {
    return `${type === 'req' ? 'req.to' : 'event.on'}.${name}.rk`;
  }

  async requestToChatService(routingKey: string, payload) {
    let response: RmqResponse;
    try {
      response = await this.amqpConnection.request<RmqResponse>({
        exchange: process.env.RMQ_CHAT_DIRECT,
        routingKey,
        payload,
      });
    } catch (reqFail) {
      throw new InternalServerErrorException('request to chat-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async createRoom(chatRoomCreationDto: ChatRoomCreationDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.create.room'),
      chatRoomCreationDto,
    );
  }

  async deleteRoom(chatRoomOwnerCommandDto: ChatRoomOwnerCommandDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.delete.room'),
      chatRoomOwnerCommandDto,
    );
  }

  async joinRoom(chatRoomJoinDto: ChatRoomJoinDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.join.room'),
      chatRoomJoinDto,
    );
  }

  async exitRoom(chatRoomUserDto: ChatRoomUserDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.exit.room'),
      chatRoomUserDto,
    );
  }

  async setRoomPassword(chatRoomSetPasswordDto: ChatRoomSetPasswordDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.set.room.password'),
      chatRoomSetPasswordDto,
    );
  }

  async setRole(chatUserRoleDto: ChatUserRoleDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.set.user.role'),
      chatUserRoleDto,
    );
  }

  async banUser(ChatRoomPenaltyWithTimeDto: ChatRoomPenaltyWithTimeDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.ban.user'),
      ChatRoomPenaltyWithTimeDto,
    );
  }

  async kickUser(chatRoomPenaltyDto: ChatRoomPenaltyDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.kick.user'),
      chatRoomPenaltyDto,
    );
  }

  async unbanUser(chatRoomUnpenalizeDto: ChatRoomUnpenalizeDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.unban.user'),
      chatRoomUnpenalizeDto,
    );
  }

  async getBanList(chatRoomAdminCommandDto: ChatRoomAdminCommandDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.ban.list'),
      chatRoomAdminCommandDto,
    );
  }

  async muteUser(ChatRoomPenaltyWithTimeDto: ChatRoomPenaltyWithTimeDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.mute.user'),
      ChatRoomPenaltyWithTimeDto,
    );
  }

  async unmuteUser(chatRoomUnpenalizeDto: ChatRoomUnpenalizeDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.unmute.user'),
      chatRoomUnpenalizeDto,
    );
  }

  async getMuteList(chatRoomAdminCommandDto: ChatRoomAdminCommandDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.mute.list'),
      chatRoomAdminCommandDto,
    );
  }

  async searchRooms(roomName: string) {
    return this.requestToChatService(this.RK('req', 'chat.search.rooms'), {
      room_name: roomName,
    });
  }

  async searchAllRooms() {
    return this.requestToChatService(
      this.RK('req', 'chat.search.all.rooms'),
      {},
    );
  }

  async setRoomAccessibility(
    chatRoomAccessibilityDto: ChatRoomAccessibilityDto,
  ) {
    return this.requestToChatService(
      this.RK('req', 'chat.set.room.access'),
      chatRoomAccessibilityDto,
    );
  }

  async storeRoomMessage(chatRoomMessageDto: ChatRoomMessageDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.store.message'),
      chatRoomMessageDto,
    );
  }

  async getAllRoomMessages(chatRoomUserDto: ChatRoomUserDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.get.all.room.messages'),
      chatRoomUserDto,
    );
  }

  async getJoinedRooms(userId: string) {
    return this.requestToChatService(
      this.RK('req', 'chat.get.joined.rooms'),
      userId,
    );
  }

  async getRoomMembers(chatRoomIdDto: ChatRoomIdDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.get.room.members'),
      chatRoomIdDto,
    );
  }

  async inviteUser(chatRoomInviteDto: ChatRoomInviteDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.invite.user'),
      chatRoomInviteDto,
    );
  }
}
