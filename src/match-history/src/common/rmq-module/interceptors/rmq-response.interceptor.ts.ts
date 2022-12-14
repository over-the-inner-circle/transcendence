import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RmqError } from 'src/common/rmq-module/types/rmq-error';
import { RmqResponse } from 'src/common/rmq-module/types/rmq-response';

@Injectable()
export class RmqResponseInterceptor<T>
  implements NestInterceptor<T, RmqResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RmqResponse<T>> {
    if (!isRabbitContext(context)) return next.handle();

    return next.handle().pipe(
      map((data: T | RmqError) => {
        if (data instanceof RmqError) return new RmqResponse(data, false);
        return new RmqResponse(data);
      }),
    );
  }
}
