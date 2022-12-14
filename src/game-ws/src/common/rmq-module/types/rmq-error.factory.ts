import { RmqError } from './rmq-error';

/* exceptionFactory for ValidationPipe */
export function RmqErrorFactory(where: string, status = 400) {
  return (errors) => {
    let messages: string[] = [];
    for (const error of errors)
      messages = messages.concat(Object.values(error.constraints));
    throw new RmqError({ code: 400, message: messages, where: where });
  };
}
