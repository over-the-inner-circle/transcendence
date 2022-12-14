import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { RmqError } from 'src/common/rmq-module/types/rmq-error';
import { RmqResponse } from 'src/common/rmq-module/types/rmq-response';
import { UserState } from './types/user-info';
import { UserProfile } from './types/user-profile';

@Injectable()
export class UserService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async readUserByNickname(nickname: string): Promise<UserProfile> {
    let response: RmqResponse<UserProfile>;
    try {
      response = await this.amqpConnection.request<RmqResponse<UserProfile>>({
        exchange: 'user.d.x',
        routingKey: 'req.to.user.read.by.nickname.rk',
        payload: { nickname },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to user-service)',
        where: 'gameWebsocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async setUserState(user_id: string, state: UserState) {
    let response;
    try {
      response = await this.amqpConnection.request<RmqResponse<UserProfile>>({
        exchange: 'user.d.x',
        routingKey: 'req.to.user.set.state.rk',
        payload: { user_id, state },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to user-service)',
        where: 'gameWebsocket',
      });
    }
    if (!response.success) throw response.error;
    return response.data;
  }
}
