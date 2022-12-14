import { Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { isObject, isString } from 'class-validator';
import { RmqError } from '../rmq/types/rmq-error';

@Catch(WsException, RmqError)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception, host) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }
  handleError(client, exception) {
    if (
      !(exception instanceof WsException) &&
      !(exception instanceof RmqError)
    ) {
      return this.handleUnknownError(exception, client);
    }
    const status = 'error';
    let error;
    if (exception instanceof WsException) {
      error = exception.getError();
      error = isString(error)
        ? {
            status,
            message: error,
          }
        : error;
    } else
      error = {
        status,
        message: exception.message,
      };

    client.emit('exception', error);
  }
}
