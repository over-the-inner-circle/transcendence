import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { isUUID, validate } from 'class-validator';
import { RmqError } from '../../common/rmq/types/rmq-error';
import { ChatService } from '../services/chat.service';

@Injectable()
export class RoomExistsGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!isRabbitContext(context))
      throw new RmqError({
        code: 400,
        message: 'Not RMQ request',
        where: 'chat-service',
      });

    const request = context.switchToRpc().getContext();
    const content = JSON.parse(request.content.toString());

    /* Guard precedes ValidatingPipe... */
    if (!content['room_id'] || !isUUID(content['room_id']))
      throw new RmqError({
        code: 400,
        message: 'Invalid room_id',
        where: 'chat-service',
      });
    const room = await this.chatService.findRoom(content.room_id);
    if (!room)
      throw new RmqError({
        code: 404,
        message: 'room not found',
        where: 'chat-service',
      });

    request['room'] = room;
    return true;
  }
}
