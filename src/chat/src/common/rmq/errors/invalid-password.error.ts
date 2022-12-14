import { RmqError } from '../types/rmq-error';

export class InvalidPasswordError extends RmqError {
  constructor() {
    super({
      code: 403,
      message: 'invalid password',
      where: 'chat-service',
    });
  }
}
