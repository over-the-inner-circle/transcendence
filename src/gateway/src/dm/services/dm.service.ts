import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RmqResponse } from '../../common/rmq/types/rmq-response';
import { DmGetMessagesDto } from '../dto/dm-get-messages.dto';

@Injectable()
export class DmService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  RK(type: 'req' | 'event', name: string) {
    return `${type === 'req' ? 'req.to' : 'event.on'}.${name}.rk`;
  }

  async requestToDmService(routingKey: string, payload) {
    let response: RmqResponse;
    try {
      response = await this.amqpConnection.request<RmqResponse>({
        exchange: process.env.RMQ_DM_DIRECT,
        routingKey,
        payload,
      });
    } catch (reqFail) {
      throw new InternalServerErrorException('request to dm-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async getAllMessages(senderId: string, receiverId: string) {
    const dto: DmGetMessagesDto = {
      receiver_id: receiverId,
      sender_id: senderId,
    };
    return this.requestToDmService(this.RK('req', 'dm.get.all.messages'), dto);
  }
}
