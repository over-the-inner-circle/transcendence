import {
  RmqUserIdDto,
  RmqUSer3pIDDto,
  RmqUserCreateDto,
  RmqUserUpdateNicknameDto,
  RmqUserNicknameDto,
  RmqUserStateDto,
} from './dto/rmq.user.request.dto';
import { UserService } from './user.service';
import { Controller, UseInterceptors } from '@nestjs/common';
import { RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { RmqResponseInterceptor } from 'src/common/rmq-module/interceptors/rmq-response.interceptor.ts';
import { RmqErrorHandler } from 'src/common/rmq-module/types/rmq-error.handler';
import { TwoFactorAuthenticationUpdateDto } from './dto/2fa-update.dto';

@UseInterceptors(new RmqResponseInterceptor())
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.create.rk',
    queue: 'user.create.q',
    errorHandler: RmqErrorHandler,
  })
  async createUser(@RabbitPayload() msg: RmqUserCreateDto) {
    return await this.userService.createUser(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.by.nickname.rk',
    queue: 'user.read.by.nickname.q',
    errorHandler: RmqErrorHandler,
  })
  async readUserByNickname(@RabbitPayload() msg: RmqUserNicknameDto) {
    const user = await this.userService.readUserByNickname(msg);
    user.created = user.created.toString();
    return user;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.by.id.rk',
    queue: 'user.read.by.id.q',
    errorHandler: RmqErrorHandler,
  })
  async readUserById(@RabbitPayload() msg: RmqUserIdDto) {
    const user = await this.userService.readUserById(msg);
    user.created = user.created.toString();
    return user;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.delete.rk',
    queue: 'user.delete.q',
    errorHandler: RmqErrorHandler,
  })
  async deleteUser(@RabbitPayload() msg: RmqUserIdDto) {
    return await this.userService.deleteUserById(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.update.nickname.rk',
    queue: 'user.update.nickname.q',
    errorHandler: RmqErrorHandler,
  })
  async updateUserNicknameById(@RabbitPayload() msg: RmqUserUpdateNicknameDto) {
    return await this.userService.updateUserNicknameById(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.update.profImg.rk',
    queue: 'user.update.profImg.q',
    errorHandler: RmqErrorHandler,
  })
  async updateUserProfImgById(@RabbitPayload() msg) {
    return await this.userService.updateUserProfImgById(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.by.3pId.rk',
    queue: 'user.read.by.3pId.q',
    errorHandler: RmqErrorHandler,
  })
  async readUserBy3pId(@RabbitPayload() msg: RmqUSer3pIDDto) {
    const user = await this.userService.readUserBy3pId(msg);
    user.created = user.created.toString();
    return user;
  }
  // 임시
  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.list.rk',
    queue: 'user.read.list.q',
    errorHandler: RmqErrorHandler,
  })
  async readUserList() {
    return await this.userService.readUserList();
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.get.state.rk',
    queue: 'user.get.state.q',
    errorHandler: RmqErrorHandler,
  })
  async getUserState(@RabbitPayload() payload: RmqUserIdDto) {
    return await this.userService.getUserState(payload);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.set.state.rk',
    queue: 'user.set.state.q',
    errorHandler: RmqErrorHandler,
  })
  async setUserState(@RabbitPayload() payload: RmqUserStateDto) {
    return this.userService.setUserState(payload);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.delete.withdrawal.user.rk',
    queue: 'user.delete.withdrawal.user.q',
    errorHandler: RmqErrorHandler,
  })
  async deleteOldWithdrawalUser() {
    return this.userService.deleteOldWithdrawalUser();
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.update.2FA.info.rk',
    queue: 'user.update.2FA.info.q',
    errorHandler: RmqErrorHandler,
  })
  async update2FAInfo(@RabbitPayload() msg: TwoFactorAuthenticationUpdateDto) {
    return await this.userService.update2FAInfo(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.enable.2FA.rk',
    queue: 'user.enable.2FA.q',
    errorHandler: RmqErrorHandler,
  })
  async enable2FA(@RabbitPayload() msg: RmqUserIdDto) {
    return await this.userService.toggle2FA(msg, true);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.disable.2FA.rk',
    queue: 'user.disable.2FA.q',
    errorHandler: RmqErrorHandler,
  })
  async disable2FA(@RabbitPayload() msg: RmqUserIdDto) {
    return await this.userService.toggle2FA(msg, false);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.delete.2FA.info.rk',
    queue: 'user.delete.2FA.info.q',
    errorHandler: RmqErrorHandler,
  })
  async delete2FAInfo(@RabbitPayload() msg: RmqUserIdDto) {
    return await this.userService.delete2FAInfo(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.get.2FA.info.rk',
    queue: 'user.get.2FA.info.q',
    errorHandler: RmqErrorHandler,
  })
  async get2FAInfo(dto: RmqUserIdDto) {
    return this.userService.get2FAInfo(dto);
  }
}
