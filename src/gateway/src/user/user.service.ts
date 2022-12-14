import { RmqResponse } from './../common/rmq/types/rmq-response';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RmqResponseUser } from './dto/user.response.dto';
import { UserInfo, UserProfile } from './user-info';
import { AwsService } from '../common/aws/aws.service';

@Injectable()
export class UserService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly awsService: AwsService,
  ) {}

  async requestSignUp(data) {
    let response: RmqResponse;

    try {
      response = await this.amqpConnection.request({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.create.rk',
        payload: data,
      });
    } catch (reqFail) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }

    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async getUserByNickname(nickname: string): Promise<UserProfile> {
    let response: RmqResponse<UserProfile>;

    try {
      response = await this.amqpConnection.request<RmqResponse<UserProfile>>({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.by.nickname.rk',
        payload: { nickname },
      });
    } catch (reqFail) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }

    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async getUserById(user_id: string): Promise<UserInfo> {
    let response: RmqResponse<UserInfo>;

    try {
      response = await this.amqpConnection.request<RmqResponse<UserInfo>>({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.read.by.id.rk',
        payload: { user_id },
      });
    } catch (reqFail) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }

    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async deleteById(user_id: string) {
    let response;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqResponseUser>
      >({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.delete.rk',
        payload: {
          user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return;
  }

  async updateNicknameById(user_id: string, newNickname: string) {
    let response;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqResponseUser>
      >({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.update.nickname.rk',
        payload: {
          user_id,
          nickname: newNickname,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  //NOTE: nullable
  async updateProfImgById(user_id: string, file: Express.Multer.File) {
    const profImgUrl = await this.awsService.uploadFileToS3(
      file,
      process.env.AWS_S3_PROFILE_PATH,
      process.env.AWS_S3_BUCKET,
      process.env.AWS_S3_REGION,
    );

    let response;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqResponseUser>
      >({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.update.profImg.rk',
        payload: {
          user_id,
          prof_img: profImgUrl,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  //NOTE: nullable
  async updateTwoFactorAuthenticationById(
    user_id: string,
    newType: string,
    newKey: string,
  ) {
    let response;
    try {
      response = await this.amqpConnection.request<
        RmqResponse<RmqResponseUser>
      >({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.update.2FA.rk',
        payload: {
          user_id,
          type: newType,
          key: newKey,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    return response.data;
  }

  async deleteOldWithdrawalUser() {
    let response;
    try {
      response = await this.amqpConnection.request<RmqResponse>({
        exchange: process.env.RMQ_USER_DIRECT,
        routingKey: 'req.to.user.delete.withdrawal.user.rk',
      });
    } catch (e) {
      throw new InternalServerErrorException('request to user-serivce failed');
    }
    if (!response.success)
      throw new HttpException(
        `${response?.error?.message} / where: ${response?.error?.where}`,
        response?.error?.code ? response.error.code : 500,
      );
    console.log(response.data);
    return;
  }
}
