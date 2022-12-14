import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { RmqError } from '../../common/rmq/types/rmq-error';
import { RmqResponse } from '../../common/rmq/types/rmq-response';
import { ChatRoomMessageDto } from '../dto/chat-room-message.dto';

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
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to chat-service)',
        where: 'Websocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async storeRoomMessage(chatRoomMessageDto: ChatRoomMessageDto) {
    return this.requestToChatService(
      this.RK('req', 'chat.store.room.message'),
      chatRoomMessageDto,
    );
  }
}
