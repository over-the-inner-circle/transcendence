import { RmqError } from '../types/rmq-error';

export class SelfPenalizeError extends RmqError {
  constructor() {
    super({
      code: 403,
      message: 'Cannot penalize oneself',
      where: 'chat-service',
    });
  }
}
