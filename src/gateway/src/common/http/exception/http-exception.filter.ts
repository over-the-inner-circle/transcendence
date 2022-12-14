import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorObject = {
      statusCode: status,
      message: exception.message,
      path: request.url,
      timestamp: new Date().toString(),
    };
    console.log(
      '============================  exception  ============================',
    );
    console.log(errorObject);
    console.log('\n');
    response.status(status).json(errorObject);
  }
}
