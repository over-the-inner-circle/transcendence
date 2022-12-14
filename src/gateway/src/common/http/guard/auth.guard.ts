import { access } from 'fs';
import { RmqResponse } from './../../rmq/types/rmq-response';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RmqError } from '../../rmq/types/rmq-error';
import { AuthService } from '../../../auth/auth.service';
import { plainToClass } from 'class-transformer';
import { JwtUserInfo } from '../../../auth/jwt-user-info';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  public async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (!authorization) throw new HttpException('Unauthorized', 401);

    const bearerToken = authorization.split(' ');
    if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer')
      throw new HttpException('Unauthorized', 401);

    const access_token = bearerToken[1];

    const payload = await this.authService.requestVerifyJwt({ access_token });
    const user = plainToClass(JwtUserInfo, payload, {
      excludeExtraneousValues: true,
    }); // To exclude iat, exp ...

    if (!user.grant) throw new UnauthorizedException('Pending Authentication');

    request['user'] = user;
    return true;
  }
}

@Injectable()
export class PendingAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  public async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (!authorization) throw new HttpException('Unauthorized', 401);

    const bearerToken = authorization.split(' ');
    if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer')
      throw new HttpException('Unauthorized', 401);

    const access_token = bearerToken[1];

    const payload = await this.authService.requestVerifyJwt({ access_token });
    const user = plainToClass(JwtUserInfo, payload, {
      excludeExtraneousValues: true,
    }); // To exclude iat, exp ...

    if (user.grant) throw new BadRequestException('Already Granted');

    request['user'] = user;
    return true;
  }
}
