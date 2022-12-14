import { RmqError } from 'src/common/rmq-module/types/rmq-error';
import {
  RmqUSer3pIDDto,
  RmqUserCreateDto,
  RmqUserIdDto,
  RmqUserUpdateNicknameDto,
  RmqUserNicknameDto,
  RmqUserStateDto,
} from './dto/rmq.user.request.dto';
import { Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { User } from 'src/common/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { UserInfo, UserProfile, UserState } from './user-info';
import { RedisService } from '../redis-module/services/redis.service';
import { RmqEvent } from '../common/rmq-module/types/rmq-event';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { plainToInstance } from 'class-transformer';
import { TwoFactorAuthenticationInfo } from './2fa-info';
import { TwoFactorAuthenticationUpdateDto } from './dto/2fa-update.dto';

const WHERE = 'user_service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  makeUserKey(userId) {
    return 'user:' + userId;
  }

  async createUser(payload: RmqUserCreateDto) {
    const user: UserInfo = this.userRepository.create(payload);
    user.mmr = 1000;
    user.is_two_factor_authentication_enabled = false;
    if (!user.prof_img)
      user.prof_img =
        'https://transcendence.s3.amazonaws.com/media/prof-img/default-1.png';
    try {
      await this.userRepository.save(user);
    } catch (e) {
      if (e.code === '23505') {
        const findUser = await this.userRepository.findOne({
          where: {
            third_party_id: payload.third_party_id,
            provider: payload.provider,
          },
          withDeleted: true,
        });
        if (findUser) {
          throw new RmqError({
            code: 409,
            message: 'This user is account has been deleted',
            where: `${WHERE}#createUser()`,
          });
        }
        throw new RmqError({
          code: 409,
          message: 'duplicate key violates unique constraint',
          where: `${WHERE}#createUser()`,
        });
      } else {
        throw new RmqError({
          code: 500,
          message: `DB Error : ${e}`,
          where: WHERE,
        });
      }
    }

    return {
      user_id: user.user_id,
      nickname: user.nickname,
      created: user.created.toString(),
    };
  }

  async readUserByNickname(payload: RmqUserNicknameDto): Promise<UserProfile> {
    let user;
    try {
      user = await this.userRepository.findOne({
        where: { nickname: payload.nickname },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    if (!user) {
      throw new RmqError({
        code: 404,
        message: `${payload.nickname} not found`,
        where: `${WHERE}#readUserByNickname()`,
      });
    }
    user = plainToClass(UserProfile, user, { excludeExtraneousValues: true });
    return user;
  }

  async readUserById(payload: RmqUserIdDto) {
    let user;
    try {
      user = await this.userRepository.findOne({
        where: { user_id: payload.user_id },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    if (!user) {
      throw new RmqError({
        code: 404,
        message: `${payload.user_id} not found`,
        where: `${WHERE}#readUserById()`,
      });
    }
    return user;
  }

  async getUserState(payload: RmqUserIdDto): Promise<UserState> {
    const state: any = await this.redisService
      .hget(this.makeUserKey(payload.user_id), 'state')
      .catch((e) => {
        throw new RmqError({
          code: 500,
          message: `Redis query failed`,
          where: `${WHERE}#getUserState()`,
        });
      });
    return state ? (state as UserState) : UserState.OFFLINE;
  }

  async setUserState(payload: RmqUserStateDto): Promise<UserState> {
    const { user_id, state } = payload;
    const event: RmqEvent = {
      recvUsers: [],
      data: state,
      created: new Date(),
    };
    try {
      switch (state) {
        case UserState.ONLINE:
        case UserState.INGAME:
          await this.redisService.hsetJson(this.makeUserKey(user_id), {
            state,
          });
          break;
        case UserState.OFFLINE:
          await this.redisService.hdel(this.makeUserKey(user_id), 'state');
      }
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `Redis query failed`,
        where: `${WHERE}#setUserState()`,
      });
    }

    this.amqpConnection.publish(
      process.env.RMQ_STATE_TOPIC,
      `event.on.state.update.${user_id}.rk`,
      event,
    );

    return state;
  }

  async deleteUserById(payload: RmqUserIdDto) {
    await this.readUserById(payload);

    let response;
    try {
      response = await this.userRepository.softDelete(payload.user_id);
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    if (!response.affected) {
      throw new RmqError({
        code: 404,
        message: `${payload.user_id} soft delete error`,
        where: `${WHERE}#deleteUserById()`,
      });
    }
    return;
  }

  async updateUserNicknameById(payload: RmqUserUpdateNicknameDto) {
    const user = await this.readUserById(payload);
    user.nickname = payload.nickname;

    try {
      await this.userRepository.save(user);
    } catch (e) {
      if (e.code === '23505') {
        throw new RmqError({
          code: 409,
          message: 'duplicate key violates unique constraint',
          where: `${WHERE}#updateUserNicknameById()`,
        });
      } else {
        throw new RmqError({
          code: 500,
          message: `DB Error : ${e}`,
          where: WHERE,
        });
      }
    }
    return { nickname: user.nickname };
  }

  async updateUserProfImgById(payload) {
    const user = await this.readUserById(payload);
    user.prof_img = payload.prof_img;
    try {
      await this.userRepository.save(user);
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    return { prof_img: user.prof_img };
  }

  async update2FAInfo(payload: TwoFactorAuthenticationUpdateDto) {
    const { user_id, info } = payload;

    const user = await this.userRepository.findOneBy({ user_id }).catch((e) => {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    });

    if (!user)
      throw new RmqError({
        code: 404,
        message: `User not found`,
        where: `${WHERE}#update2FAInfo()`,
      });

    user.two_factor_authentication_type = info.type;
    user.two_factor_authentication_key = info.key;

    try {
      await this.userRepository.save(user);
    } catch (e) {
      if (e.code === '23505') {
        throw new RmqError({
          code: 409,
          message: 'duplicate key violates unique constraint',
          where: `${WHERE}#update2FAInfo()`,
        });
      } else {
        throw new RmqError({
          code: 500,
          message: `DB Error : ${e}`,
          where: `${WHERE}#update2FAInfo()`,
        });
      }
    }
    return info;
  }

  async toggle2FA(payload: RmqUserIdDto, value: boolean) {
    const { user_id } = payload;
    const user = await this.readUserById({ user_id });
    user.is_two_factor_authentication_enabled = value;

    try {
      await this.userRepository.save(user);
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: `${WHERE}#toggle2FA`,
      });
    }
    return;
  }

  async delete2FAInfo(payload: RmqUserIdDto) {
    const { user_id } = payload;
    const user: UserInfo = await this.readUserById({ user_id });
    user.two_factor_authentication_type = null;
    user.two_factor_authentication_key = null;
    user.is_two_factor_authentication_enabled = false;
    try {
      await this.userRepository.save(user);
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    return;
  }

  async readUserBy3pId(payload: RmqUSer3pIDDto): Promise<UserInfo> {
    let user;
    try {
      user = await this.userRepository.findOne({
        where: {
          third_party_id: payload.third_party_id,
          provider: payload.provider,
        },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    if (!user) {
      throw new RmqError({
        code: 404,
        message: `${payload.third_party_id} not found`,
        where: `${WHERE}#readUserBy3pId()`,
      });
    }
    return user;
  }

  async readUserListById(userIdList) {
    const list = await Promise.all(
      Object.values(userIdList).map(async (item: string) => {
        try {
          const user = await this.userRepository.findOne({
            where: { user_id: item },
          });
          const userProfile: UserProfile = plainToInstance(UserProfile, user);
          userProfile.state = await this.getUserState({
            user_id: userProfile.user_id,
          });
          return userProfile;
        } catch (e) {
          throw new RmqError({
            code: 500,
            message: `DB Error : ${e}`,
            where: WHERE,
          });
        }
      }),
    );
    return list;
  }

  async readUserList() {
    let list;
    try {
      list = await this.userRepository.find();
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    return list;
  }

  async deleteOldWithdrawalUser() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    let list;
    try {
      list = await this.userRepository.find({
        where: { deleted: LessThan(date) },
        withDeleted: true,
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    const deleteList = [];
    list.map((user) => {
      try {
        this.userRepository.delete(user.user_id);
        console.log(`${user.user_id} hard delete`);
        deleteList.push(user.user_id);
      } catch (e) {
        throw new RmqError({
          code: 500,
          message: `DB Error : ${e}`,
          where: WHERE,
        });
      }
    });
    return deleteList;
  }

  async get2FAInfo(dto: RmqUserIdDto) {
    const user = await this.userRepository.findOneBy(dto).catch((e) => {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    });

    const info = new TwoFactorAuthenticationInfo();
    info.type = user.two_factor_authentication_type;
    info.key = user.two_factor_authentication_key;

    return info;
  }
}
