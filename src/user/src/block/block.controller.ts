import { BlockService } from './block.service';
import { RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Controller, UseInterceptors } from '@nestjs/common';
import { RmqErrorHandler } from 'src/common/rmq-module/types/rmq-error.handler';
import {
  RmqRequestBlock,
  RmqUserId,
  RmqDeleteBlock,
} from './dto/rmq.block.request';
import { RmqResponseInterceptor } from 'src/common/rmq-module/interceptors/rmq-response.interceptor.ts';

@UseInterceptors(new RmqResponseInterceptor())
@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.block.rk',
    queue: 'user.read.block.q',
    errorHandler: RmqErrorHandler,
  })
  async readBlockList(@RabbitPayload() msg: RmqUserId) {
    const list = await this.blockService.readBlockList(msg);
    return list;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.create.block.rk',
    queue: 'user.create.block.q',
    errorHandler: RmqErrorHandler,
  })
  async createBlock(@RabbitPayload() msg: RmqRequestBlock) {
    const block = await this.blockService.createBlock(msg);
    block.created = block.created.toString();
    return block;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.delete.block.rk',
    queue: 'user.delete.block.q',
    errorHandler: RmqErrorHandler,
  })
  async deleteBlock(@RabbitPayload() msg: RmqDeleteBlock) {
    return await this.blockService.deleteBlock(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.is.blocked.rk',
    queue: 'user.is.blocked.q',
    errorHandler: RmqErrorHandler,
  })
  async isBlocked(@RabbitPayload() msg: RmqRequestBlock) {
    return await this.blockService.isBlocked(msg);
  }
}
