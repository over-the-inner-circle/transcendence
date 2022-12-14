import { RmqError } from '../types/rmq-error';

export class UserNotInScopeError extends RmqError {
  constructor() {
    super({
      code: 404,
      message: 'user not found in this scope',
      where: 'chat-service',
    });
  }
}
