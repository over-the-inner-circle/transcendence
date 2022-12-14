import { RmqMatchHistoryRankHistoryDto } from './dto/rmq.match-history.rank-history.dto';
import { RmqMatchHistoryGameIdDto } from './dto/rmq.match-history.game-id.dto';
import { RmqResponseInterceptor } from './../common/rmq-module/interceptors/rmq-response.interceptor.ts';
import { Controller, UseInterceptors } from '@nestjs/common';
import { RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { RmqErrorHandler } from 'src/common/rmq-module/types/rmq-error.handler';
import { MatchHistoryService } from './match-history.service';
import { RmqMatchHistoryGameInfoDto } from './dto/rmq.match-history.game-info.dto';
import { RmqMatchHistoryGameResultDto } from './dto/rmq.match-history.game-result.dto';
import { RmqMatchHistoryReadByIdDto } from './dto/rmq.match-history.read-by-id.dto';

@UseInterceptors(new RmqResponseInterceptor())
@Controller()
export class MatchHistoryController {
  constructor(private readonly matchHistoryService: MatchHistoryService) {}
  @RabbitRPC({
    exchange: 'match-history.d.x',
    routingKey: 'req.to.match-history.create.game-info.rk',
    queue: 'match-history.create.game-info.q',
    errorHandler: RmqErrorHandler,
  })
  async createGameInfo(@RabbitPayload() msg: RmqMatchHistoryGameInfoDto) {
    return await this.matchHistoryService.createGameInfo(msg);
  }

  @RabbitRPC({
    exchange: 'match-history.d.x',
    routingKey: 'req.to.match-history.create.game-result.rk',
    queue: 'match-history.create.game-result.q',
    errorHandler: RmqErrorHandler,
  })
  async createGameResult(@RabbitPayload() msg: RmqMatchHistoryGameResultDto) {
    return await this.matchHistoryService.createGameResult(msg);
  }

  @RabbitRPC({
    exchange: 'match-history.d.x',
    routingKey: 'req.to.match-history.create.rank-history.rk',
    queue: 'match-history.create.rank-history.q',
    errorHandler: RmqErrorHandler,
  })
  async createRankHistory(@RabbitPayload() msg: RmqMatchHistoryRankHistoryDto) {
    return await this.matchHistoryService.createRankHistory(msg);
  }

  @RabbitRPC({
    exchange: 'match-history.d.x',
    routingKey: 'req.to.match-history.read.game-result.rk',
    queue: 'match-history.read.game-result.q',
    errorHandler: RmqErrorHandler,
  })
  async readGameResult(@RabbitPayload() msg: RmqMatchHistoryGameIdDto) {
    return await this.matchHistoryService.readGameResult(msg);
  }

  @RabbitRPC({
    exchange: 'match-history.d.x',
    routingKey: 'req.to.match-history.read.match-history.by.id.rk',
    queue: 'match-history.read.match-history.by.id.q',
    errorHandler: RmqErrorHandler,
  })
  async readMatchHistoryById(@RabbitPayload() msg: RmqMatchHistoryReadByIdDto) {
    return await this.matchHistoryService.readMatchHistoryById(msg);
  }
}
