import { FriendService } from './../friend/friend.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from 'src/common/entities/Block';
import { Repository } from 'typeorm';
import {
  RmqRequestBlock,
  RmqUserId,
  RmqDeleteBlock,
} from './dto/rmq.block.request';
import { RmqError } from 'src/common/rmq-module/types/rmq-error';
import { plainToInstance } from 'class-transformer';
import { UserInfo, UserProfile } from '../user/user-info';

function toUserProfile(user: UserInfo): UserProfile {
  return plainToInstance(UserProfile, user, {
    excludeExtraneousValues: true,
  });
}

const WHERE = 'user_service';

@Injectable()
export class BlockService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private readonly friendService: FriendService,
  ) {}
  async readBlockList(payload: RmqUserId) {
    let blackList;
    try {
      blackList = await this.blockRepository.find({
        where: { blocker: payload.user_id },
        relations: ['user_blocker', 'user_blocked'],
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }

    if (blackList.length === 0) {
      throw new RmqError({
        code: 404,
        message: 'Not found list',
        where: `${WHERE}#readBlockList()`,
      });
    }

    return {
      block_list: blackList.map((b) => {
        return {
          block_id: b.block_id,
          blocker: toUserProfile(b.user_blocker),
          blocked: toUserProfile(b.user_blocked),
          created: b.created.toString(),
        };
      }),
    };
  }

  async createBlock(payload: RmqRequestBlock) {
    if (this.friendService.isSameId(payload.blocker, payload.blocked)) {
      throw new RmqError({
        code: 409,
        message: 'same id',
        where: `${WHERE}#createBlock()`,
      });
    }

    let block;
    try {
      block = await this.blockRepository.findOne({
        where: { blocker: payload.blocker, blocked: payload.blocked },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    if (block) {
      throw new RmqError({
        code: 409,
        message: 'already request',
        where: `${WHERE}#createBlock()`,
      });
    }

    block = this.blockRepository.create(payload);
    try {
      await this.blockRepository.save(block);
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    return block;
  }

  async deleteBlock(payload: RmqDeleteBlock) {
    let findBlock;
    try {
      findBlock = await this.blockRepository.findOne({
        where: { block_id: payload.block_id },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }

    if (!findBlock || findBlock.blocker !== payload.user_id) {
      throw new RmqError({
        code: 409,
        message: 'not found request',
        where: `${WHERE}#deleteBlock()`,
      });
    }

    try {
      await this.blockRepository.remove(findBlock);
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    return;
  }

  async isBlocked(payload: RmqRequestBlock) {
    let block: Block;
    try {
      block = await this.blockRepository.findOne({
        where: { blocker: payload.blocker, blocked: payload.blocked },
      });
    } catch (e) {
      throw new RmqError({
        code: 500,
        message: `DB Error : ${e}`,
        where: WHERE,
      });
    }
    return block ? true : false;
  }
}
