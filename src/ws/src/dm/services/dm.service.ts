import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RmqResponse } from '../../common/rmq/types/rmq-response';
import { DmDto } from '../dto/dm.dto';
import { RmqError } from '../../common/rmq/types/rmq-error';

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
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to dm-service)',
        where: 'Websocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async storeMessage(data: DmDto) {
    return this.requestToDmService(this.RK('req', 'dm.store.message'), data);
  }
}
