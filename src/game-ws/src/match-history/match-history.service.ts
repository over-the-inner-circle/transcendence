import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import {
  RmqMatchHistoryGameInfo,
  RmqMatchHistoryGameResult,
  RmqMatchHistoryRankHistory,
  RmqMatchHistoryGame,
} from './match-history.response.info';
import { RmqMatchHistoryGameId } from './dto/match-game-id.dto';
import { RmqResponse } from 'src/common/rmq-module/types/rmq-response';
import { RmqError } from 'src/common/rmq-module/types/rmq-error';
import { RmqRequestMatchHistoryGameInfoDto } from './dto/match-info.dto';
import { RmqRequestMatchHistoryGameResultDto } from './dto/match-result.dto';
import { RmqMatchHistoryRankHistoryDto } from './dto/match-rank-history.dto';

@Injectable()
export class MatchHistoryService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async createGameInfo(
    gameInfo: RmqRequestMatchHistoryGameInfoDto,
  ): Promise<RmqMatchHistoryGameInfo> {
    let response: RmqResponse<RmqMatchHistoryGameInfo>;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqMatchHistoryGameInfo>
      >({
        exchange: 'match-history.d.x',
        routingKey: 'req.to.match-history.create.game-info.rk',
        payload: gameInfo,
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to match-history)',
        where: 'gameWebsocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async createGameResult(
    gameResult: RmqRequestMatchHistoryGameResultDto,
  ): Promise<RmqMatchHistoryGameResult> {
    let response: RmqResponse<RmqMatchHistoryGameResult>;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqMatchHistoryGameResult>
      >({
        exchange: 'match-history.d.x',
        routingKey: 'req.to.match-history.create.game-result.rk',
        payload: gameResult,
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to match-history)',
        where: 'gameWebsocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async createRankHistory(
    rankHistory: RmqMatchHistoryRankHistoryDto,
  ): Promise<RmqMatchHistoryRankHistory> {
    let response: RmqResponse<RmqMatchHistoryRankHistory>;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqMatchHistoryRankHistory>
      >({
        exchange: 'match-history.d.x',
        routingKey: 'req.to.match-history.create.rank-history.rk',
        payload: rankHistory,
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to match-history)',
        where: 'gameWebsocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async readGameResult(
    gameId: RmqMatchHistoryGameId,
  ): Promise<RmqMatchHistoryGame> {
    let response: RmqResponse<RmqMatchHistoryGame>;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqMatchHistoryGame>
      >({
        exchange: 'match-history.d.x',
        routingKey: 'req.to.match-history.read.game-result.rk',
        payload: gameId,
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to match-history)',
        where: 'gameWebsocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }
}
