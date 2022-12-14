import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DM } from '../../common/entities/dm.entity';
import { toRmqError } from '../../common/rmq/errors/to-rmq-error';
import { toUserProfile } from '../../common/utils/utils';
import { UserService } from '../../user/services/user.service';
import { DmGetMessagesDto } from '../dto/dm-get-messages.dto';
import { DmDto } from '../dto/dm.dto';

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DM)
    private readonly dmRepository: Repository<DM>,
    private readonly userService: UserService,
  ) {}

  async storeMessage(dmDto: DmDto) {
    const dm = this.dmRepository.create({
      senderId: dmDto.sender_id,
      receiverId: dmDto.receiver_id,
      payload: dmDto.payload,
    });
    const saved = await this.dmRepository.save(dm).catch((e) => {
      throw toRmqError(e);
    });
    return saved.dmId;
  }

  async getAllMessages(data: DmGetMessagesDto) {
    //NOTE: 현재는 null-user와의 dm을 불러오는 요청은 Validation Fail될 것
    const where = [
      { receiverId: data.receiver_id, senderId: data.sender_id },
      { senderId: data.receiver_id, receiverId: data.sender_id },
    ];
    if (
      await this.userService.isBlocked({
        blocker: data.sender_id /* API requester */,
        blocked: data.receiver_id,
      })
    ) {
      where.pop();
    }

    const messages = await this.dmRepository
      .find({
        where,
        order: { created: 'ASC' },
        relations: ['sender', 'receiver'],
      })
      .catch((e) => {
        throw toRmqError(e);
      });

    return {
      messages: messages.map((dm) => {
        return {
          sender: dm.sender ? toUserProfile(dm.sender) : null,
          receiver: dm.receiver ? toUserProfile(dm.receiver) : null,
          payload: dm.payload,
          created: dm.created,
        };
      }),
    };
  }
}
