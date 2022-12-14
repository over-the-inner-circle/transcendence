import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class FriendService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async getFriends(user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.friend.rk',
        payload: {
          user_id: user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async deleteFriend(user_id, friend_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.delete.friend.rk',
        payload: {
          user_id: user_id,
          friend_id: friend_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return;
  }
  //request==========================================================
  async getRequestsSentList(user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.friend.request.sent.list.rk',
        payload: {
          user_id: user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async getRequestsRecvList(user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.friend.request.recv.list.rk',
        payload: {
          user_id: user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async makeRequest(user_id, receiver) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.create.friend.request.rk',
        payload: {
          requester: user_id,
          receiver: receiver,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async cancelRequest(request_id, user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.cancel.friend.request.rk',
        payload: {
          requester: user_id,
          request_id: request_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return;
  }

  async acceptRequest(request_id, user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.accept.friend.request.rk',
        payload: {
          request_id: request_id,
          receiver: user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return {
      statusCode: 201,
      message: 'friend relationship created',
    };
  }

  async rejectRequest(request_id, user_id) {
    let response;
    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.reject.friend.request.rk',
        payload: {
          receiver: user_id,
          request_id: request_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-service failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return;
  }
}
