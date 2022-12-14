import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RmqResponseUser } from './user/dto/user.response.dto';
import { RmqResponse } from './common/rmq/types/rmq-response';
import { Body, Controller, Get, HttpException } from '@nestjs/common';

@Controller('/test')
export class TestController {
  constructor(private readonly amqpConnection: AmqpConnection) {}
  @Get('user-list')
  async getAllUser() {
    const response: RmqResponse<RmqResponseUser> =
      await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.list.rk',
        payload: {},
      });
    if (!response.success) throw new HttpException(response.error, 500);
    return response;
  }
}
