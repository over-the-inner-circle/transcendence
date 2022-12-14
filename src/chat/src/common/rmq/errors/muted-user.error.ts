import { RmqError } from '../types/rmq-error';

export class MutedUserError extends RmqError {
  constructor() {
    super({
      code: 403,
      message: 'muted user',
      where: 'chat-service',
    });
  }
}
