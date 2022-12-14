import { RmqError } from '../types/rmq-error';

export class AdminPrivileageError extends RmqError {
  constructor() {
    super({
      code: 401,
      message: 'need room-admin privilege',
      where: 'chat-service',
    });
  }
}
