import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { resolveObjectURL } from 'buffer';

@Injectable()
export class BlockService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async getBlockList(user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.block.rk',
        payload: {
          user_id: user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async blockUser(user_id, blockedId) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.create.block.rk',
        payload: {
          blocker: user_id,
          blocked: blockedId,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async cancelBlock(block_id, user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.delete.block.rk',
        payload: {
          block_id: block_id,
          user_id: user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return;
  }
}
