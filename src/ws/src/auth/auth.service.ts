import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { RmqError } from '../common/rmq/types/rmq-error';
import { RmqResponse } from '../common/rmq/types/rmq-response';
import { JwtUserInfo } from '../user/types/user-info';

@Injectable()
export class AuthService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async verifyJwt(accessToken): Promise<JwtUserInfo> {
    let response: RmqResponse<JwtUserInfo>;
    try {
      response = await this.amqpConnection.request<RmqResponse<JwtUserInfo>>({
        exchange: 'auth.d.x',
        routingKey: 'req.to.auth.verify.jwt.rk',
        payload: { access_token: accessToken },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: 'Request Time Out (to auth-service)',
        where: 'Websocket',
      });
    }
    if (!response.success) throw new RmqError(response.error);
    return response.data;
  }
}
