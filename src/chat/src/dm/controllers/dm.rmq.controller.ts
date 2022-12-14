import {
  RabbitPayload,
  RabbitRequest,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RmqResponseInterceptor } from '../../common/rmq/interceptors/rmq-response.interceptor';
import { RmqErrorFactory } from '../../common/rmq/rmq-error.factory';
import { RmqErrorHandler } from '../../common/rmq/rmq-error.handler';
import { DmGetMessagesDto } from '../dto/dm-get-messages.dto';
import { DmDto } from '../dto/dm.dto';
import { DmService } from '../services/dm.service';

@UseInterceptors(RmqResponseInterceptor)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,

    exceptionFactory: RmqErrorFactory('chat-service'),
  }),
)
@Controller()
export class DmRmqController {
  constructor(private readonly dmService: DmService) {}

  @RabbitRPC({
    exchange: 'dm.d.x',
    queue: 'dm.store.message.q',
    routingKey: 'req.to.dm.store.message.rk',
    errorHandler: RmqErrorHandler,
  })
  async storeMessage(@RabbitRequest() req, @RabbitPayload() dmDto: DmDto) {
    return this.dmService.storeMessage(dmDto);
  }

  @RabbitRPC({
    exchange: 'dm.d.x',
    queue: 'dm.get.all.messages.q',
    routingKey: 'req.to.dm.get.all.messages.rk',
    errorHandler: RmqErrorHandler,
  })
  async getAllMessages(
    @RabbitRequest() req,
    @RabbitPayload() data: DmGetMessagesDto,
  ) {
    return this.dmService.getAllMessages(data);
  }
}
