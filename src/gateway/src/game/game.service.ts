import { UserInfo, UserProfile } from './../user/user-info';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { RmqEvent } from 'src/common/rmq/types/rmq-event';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GameService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async inviteById(recvUser: string, senderProfile: UserInfo) {
    const sender = plainToClass(UserProfile, senderProfile, {
      excludeExtraneousValues: true,
    });
    console.log(sender);
    const event: RmqEvent = {
      recvUsers: [recvUser],
      data: { sender },
      created: new Date(),
    };
    this.amqpConnection.publish(
      'game.t.x',
      'event.on.game.invitation.rk',
      event,
    );
    return;
  }
}
