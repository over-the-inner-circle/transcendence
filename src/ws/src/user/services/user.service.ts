import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RmqResponse } from '../../common/rmq/types/rmq-response';
import { UserProfile } from '../types/user-profile';
import { RmqError } from '../../common/rmq/types/rmq-error';
import { UserState } from '../types/user-info';

@Injectable()
export class UserService {
  constructor(private readonly amqpConnection: AmqpConnection) {}
  RK(type: 'req' | 'event', name: string) {
    return `${type === 'req' ? 'req.to' : 'event.on'}.${name}.rk`;
  }

  async requestToUserService(routingKey: string, payload) {
    let response: RmqResponse<any>;
    try {
      response = await this.amqpConnection.request<RmqResponse>({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey,
        payload,
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to user-service)',
        where: 'Websocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  async getUserProfileByNickname(nickname: string): Promise<UserProfile> {
    return this.requestToUserService(this.RK('req', 'user.read.by.nickname'), {
      nickname,
    });
  }

  async getUserProfileById(user_id: string): Promise<UserProfile> {
    return this.requestToUserService(this.RK('req', 'user.read.by.id'), {
      user_id,
    });
  }

  async getFriends(user_id: string): Promise<UserProfile[]> {
    return this.requestToUserService(this.RK('req', 'user.read.friend'), {
      user_id,
    });
  }

  async setUserState(dto: {
    user_id: string;
    state: UserState;
  }): Promise<UserState> {
    return this.requestToUserService(this.RK('req', 'user.set.state'), dto);
  }

  async isBlocked(dto: { blocker: string; blocked: string }): Promise<boolean> {
    return this.requestToUserService(this.RK('req', 'user.is.blocked'), dto);
  }
}
