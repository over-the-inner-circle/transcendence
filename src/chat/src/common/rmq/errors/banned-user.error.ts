import { RmqError } from '../types/rmq-error';

export class BannedUserError extends RmqError {
  constructor() {
    super({
      code: 403,
      message: 'banned user',
      where: 'chat-service',
    });
  }
}
