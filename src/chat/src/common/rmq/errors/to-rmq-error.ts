import { TypeORMError } from 'typeorm';
import { RmqError } from '../types/rmq-error';

export function toRmqError(e: TypeORMError) {
  return new RmqError({
    code: 500,
    message: e.message,
    where: 'chat-service',
  });
}
