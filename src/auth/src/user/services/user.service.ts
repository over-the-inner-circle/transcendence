import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { RmqError } from '../../common/rmq/types/rmq-error';
import { RmqResponse } from '../../common/rmq/types/rmq-response';
import { ThirdPartyInfo } from '../../auth/dto/third-party-info';
import { UserIdDto } from '../dto/user-id.dto';
import { TwoFactorAuthenticationUpdateDto } from '../dto/2fa-update.dto';

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
        where: 'auth-service',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }

  /* after get user's info by oauth provider */
  async requestUserInfoBy3pId(thirdPartyInfo: ThirdPartyInfo) {
    return this.requestToUserService(
      this.RK('req', 'user.read.by.3pId'),
      thirdPartyInfo,
    );
  }

  async requestUserInfoById(user_id: string) {
    return this.requestToUserService(this.RK('req', 'user.read.by.id'), {
      user_id,
    });
  }

  async requestCreateUser(data: CreateUserDto) {
    return this.requestToUserService(this.RK('req', 'user.create'), data);
  }

  async update2FAInfo(data: TwoFactorAuthenticationUpdateDto) {
    const res = await this.requestToUserService(
      this.RK('req', 'user.update.2FA.info'),
      data,
    );
    return res;
  }

  async enable2FA(data: UserIdDto) {
    return this.requestToUserService(this.RK('req', 'user.enable.2FA'), data);
  }

  async disable2FA(data: UserIdDto) {
    return this.requestToUserService(this.RK('req', 'user.disable.2FA'), data);
  }

  async delete2FAInfo(data: UserIdDto) {
    return this.requestToUserService(
      this.RK('req', 'user.user.delete.2FA.info'),
      data,
    );
  }

  async get2FAInfo(data: UserIdDto) {
    return this.requestToUserService(this.RK('req', 'user.get.2FA.info'), data);
  }
}
