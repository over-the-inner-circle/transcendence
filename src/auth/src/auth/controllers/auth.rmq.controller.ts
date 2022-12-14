import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  VerifyAccessJwtRequestDto,
  VerifyRefreshJwtRequestDto,
} from '../dto/verify-jwt-request.dto';
import { RmqResponseInterceptor } from '../../common/rmq/interceptors/rmq-response.interceptor';
import { RmqErrorFactory } from '../../common/rmq/rmq-error.factory';
import { RmqErrorHandler } from '../../common/rmq/rmq-error.handler';
import { TwoFactorAuthenticationGenerateDto } from '../dto/2fa-generate.dto';
import { TwoFactorAuthenticationOtpDto } from '../dto/2fa-otp.dto';
import { TwoFactorAuthenticationUpdateWithOtpDto } from '../dto/2fa-update-with-otp.dto';

const pipeOption = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,

  exceptionFactory: RmqErrorFactory('auth-service'),
};
@UseInterceptors(RmqResponseInterceptor)
@UsePipes(new ValidationPipe(pipeOption))
@Controller('auth-rmq')
export class AuthRmqController {
  constructor(private readonly authService: AuthService) {}

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.verify.jwt.q',
    routingKey: 'req.to.auth.verify.jwt.rk',
    errorHandler: RmqErrorHandler,
  })
  async verifyJwt(msg: VerifyAccessJwtRequestDto) {
    return this.authService.verifyJwt(msg, process.env.JWT_ACCESS_SECRET);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.refresh.jwt.q',
    routingKey: 'req.to.auth.refresh.jwt.rk',
    errorHandler: RmqErrorHandler,
  })
  async refresh(msg: VerifyRefreshJwtRequestDto) {
    return this.authService.refresh(
      msg.refresh_token,
      process.env.JWT_REFRESH_SECRET,
    );
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.signin.42.q',
    routingKey: 'req.to.auth.signin.42.rk',
    errorHandler: RmqErrorHandler,
  })
  async oauth42(msg: { authorization_code: string }) {
    return this.authService.oauth42(msg.authorization_code);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.signin.kakao.q',
    routingKey: 'req.to.auth.signin.kakao.rk',
    errorHandler: RmqErrorHandler,
  })
  async oauthKakao(msg: { authorization_code: string }) {
    return this.authService.oauthKakao(msg.authorization_code);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.signin.google.q',
    routingKey: 'req.to.auth.signin.google.rk',
    errorHandler: RmqErrorHandler,
  })
  async oauthGoogle(msg: { authorization_code: string }) {
    return this.authService.oauthGoogle(msg.authorization_code);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.signout.q',
    routingKey: 'req.to.auth.signout.rk',
    errorHandler: RmqErrorHandler,
  })
  async signOut(msg: VerifyRefreshJwtRequestDto) {
    return this.authService.signOut(msg.refresh_token);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.verify.2FA.q',
    routingKey: 'req.to.auth.verify.2FA.rk',
    errorHandler: RmqErrorHandler,
  })
  async verify2FA(dto: TwoFactorAuthenticationUpdateWithOtpDto) {
    return await this.authService.verify2FA(dto);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.generate.2FA.key.q',
    routingKey: 'req.to.auth.generate.2FA.key.rk',
    errorHandler: RmqErrorHandler,
  })
  async generateSecret(dto: TwoFactorAuthenticationGenerateDto) {
    return await this.authService.generateSecret(dto);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.update.2FA.info.q',
    routingKey: 'req.to.auth.update.2FA.info.rk',
    errorHandler: RmqErrorHandler,
  })
  async update2FAInfo(dto: TwoFactorAuthenticationUpdateWithOtpDto) {
    return await this.authService.updateInfo(dto);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.enable.2FA.q',
    routingKey: 'req.to.auth.enable.2FA.rk',
    errorHandler: RmqErrorHandler,
  })
  async enable2FA(dto: TwoFactorAuthenticationOtpDto) {
    return await this.authService.enable(dto);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.disable.2FA.q',
    routingKey: 'req.to.auth.disable.2FA.rk',
    errorHandler: RmqErrorHandler,
  })
  async disable2FA(dto: TwoFactorAuthenticationOtpDto) {
    return await this.authService.disable(dto);
  }

  @RabbitRPC({
    exchange: 'auth.d.x',
    queue: 'auth.delete.2FA.info.q',
    routingKey: 'req.to.auth.delete.2FA.info.rk',
    errorHandler: RmqErrorHandler,
  })
  async delete2FAInfo(dto: TwoFactorAuthenticationOtpDto) {
    return await this.authService.deleteInfo(dto);
  }
}
