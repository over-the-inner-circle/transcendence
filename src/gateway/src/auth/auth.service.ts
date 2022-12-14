import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RmqResponse } from '../common/rmq/types/rmq-response';
import { TwoFactorAuthenticationOtpDto } from './dto/2fa-otp.dto';
import { TwoFactorAuthenticationGenerateDto } from './dto/2fa-generate.dto';
import { TwoFactorAuthenticationUpdateWithOtpDto } from './dto/2fa-update-with-otp.dto';
import { JwtUserInfo } from './jwt-user-info';

type Tokens = { access_token?: string; refresh_token?: string };
@Injectable()
export class AuthService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly userService: UserService,
  ) {}

  RK(type: 'req' | 'event', name: string) {
    return `${type === 'req' ? 'req.to' : 'event.on'}.${name}.rk`;
  }

  async requestToAuthService(routingKey: string, payload): Promise<any> {
    let response: RmqResponse;
    try {
      response = await this.amqpConnection.request<RmqResponse>({
        exchange: process.env.RMQ_AUTH_DIRECT,
        routingKey,
        payload,
      });
    } catch (reqFail) {
      throw new InternalServerErrorException('request to auth-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async requestVerifyJwt(token: Tokens): Promise<JwtUserInfo> {
    return this.requestToAuthService(this.RK('req', `auth.verify.jwt`), token);
  }

  async requestVerify2FA(dto: TwoFactorAuthenticationOtpDto): Promise<Tokens> {
    return this.requestToAuthService(this.RK('req', `auth.verify.2FA`), dto);
  }

  async requestSignIn(provider: string, code: string): Promise<Tokens> {
    return this.requestToAuthService(
      this.RK('req', `auth.signin.${provider}`),
      { authorization_code: code },
    );
  }

  async requestRefresh(token): Promise<Tokens> {
    return this.requestToAuthService(this.RK('req', `auth.refresh.jwt`), {
      refresh_token: token,
    });
  }

  async requestGenerate2FASecret(dto: TwoFactorAuthenticationGenerateDto) {
    return this.requestToAuthService(
      this.RK('req', `auth.generate.2FA.key`),
      dto,
    );
  }
  async requestUpdate2FAInfo(dto: TwoFactorAuthenticationUpdateWithOtpDto) {
    return this.requestToAuthService(
      this.RK('req', `auth.update.2FA.info`),
      dto,
    );
  }
  async requestEnable2FA(dto: TwoFactorAuthenticationOtpDto) {
    return this.requestToAuthService(this.RK('req', `auth.enable.2FA`), dto);
  }

  async requestDisable2FA(dto: TwoFactorAuthenticationOtpDto) {
    return this.requestToAuthService(this.RK('req', `auth.disable.2FA`), dto);
  }

  async requestDelete2FAInfo(dto: TwoFactorAuthenticationOtpDto) {
    return this.requestToAuthService(
      this.RK('req', `auth.delete.2FA.info`),
      dto,
    );
  }
}
