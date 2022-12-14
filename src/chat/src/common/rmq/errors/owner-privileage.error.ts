import { RmqError } from '../types/rmq-error';

export class OwnerPrivileageError extends RmqError {
  constructor() {
    super({
      code: 401,
      message: 'need room-owner privilege',
      where: 'chat-service',
    });
  }
}
