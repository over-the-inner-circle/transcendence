import { FriendService } from './friend.service';
import { RmqResponseInterceptor } from 'src/common/rmq-module/interceptors/rmq-response.interceptor.ts';
import { RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Controller, UseInterceptors } from '@nestjs/common';
import { RmqErrorHandler } from 'src/common/rmq-module/types/rmq-error.handler';
import {
  RmqRequestFriend,
  RmqDeleteFriend,
  RmqCancelFriendRequest,
  RmqAcceptFriendRequest,
  RmqRejectFriendRequest,
  RmqUserId,
} from './dto/rmq.friend.request';

@UseInterceptors(new RmqResponseInterceptor())
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.friend.rk',
    queue: 'user.read.friend.q',
    errorHandler: RmqErrorHandler,
  })
  async readFriend(@RabbitPayload() msg: RmqUserId) {
    return await this.friendService.readFriend(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.delete.friend.rk',
    queue: 'user.delete.friend.q',
    errorHandler: RmqErrorHandler,
  })
  async deleteFriend(@RabbitPayload() msg: RmqDeleteFriend) {
    return await this.friendService.deleteFriend(msg);
  }

  //request=====================================================
  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.friend.request.sent.list.rk',
    queue: 'user.read.friend.request.sent.list.q',
    errorHandler: RmqErrorHandler,
  })
  async readSentFriendRequest(@RabbitPayload() msg: RmqUserId) {
    const request = await this.friendService.readSentFriendRequest(msg);
    Object.values(request).map((item: any) => {
      item.created = item.created.toString();
    });
    return request;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.read.friend.request.recv.list.rk',
    queue: 'user.read.friend.request.recv.list.q',
    errorHandler: RmqErrorHandler,
  })
  async readRecvFriendRequest(@RabbitPayload() msg: RmqUserId) {
    const request = await this.friendService.readRecvFriendRequest(msg);
    Object.values(request).map((item: any) => {
      item.created = item.created.toString();
    });
    return request;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.create.friend.request.rk',
    queue: 'user.create.friend.request.q',
    errorHandler: RmqErrorHandler,
  })
  async createFriendRequest(@RabbitPayload() msg: RmqRequestFriend) {
    const request = await this.friendService.createFriendRequest(msg);
    request.created = request.created.toString();
    return request;
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.cancel.friend.request.rk',
    queue: 'user.cancel.friend.request.q',
    errorHandler: RmqErrorHandler,
  })
  async cancelFriendRequest(@RabbitPayload() msg: RmqCancelFriendRequest) {
    return await this.friendService.cancelFriendRequest(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.accept.friend.request.rk',
    queue: 'user.accept.friend.request.q',
    errorHandler: RmqErrorHandler,
  })
  async acceptFriendRequest(@RabbitPayload() msg: RmqAcceptFriendRequest) {
    return this.friendService.acceptFriendRequest(msg);
  }

  @RabbitRPC({
    exchange: 'user.d.x',
    routingKey: 'req.to.user.reject.friend.request.rk',
    queue: 'user.reject.friend.request.q',
    errorHandler: RmqErrorHandler,
  })
  async rejectFriendRequest(@RabbitPayload() msg: RmqRejectFriendRequest) {
    return await this.friendService.rejectFriendRequest(msg);
  }
}
