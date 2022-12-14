import * as amqplib from 'amqplib';
import { RmqError } from 'src/common/rmq-module/types/rmq-error';
import { RmqResponse } from 'src/common/rmq-module/types/rmq-response';

export function RmqErrorHandler(
  channel: amqplib.Channel,
  msg: amqplib.ConsumeMessage,
  error: any,
) {
  if (typeof error !== 'string' && !(error instanceof RmqError)) {
    error = JSON.stringify(error);
  }
  const errorResponse = new RmqResponse(error, false);

  const { replyTo, correlationId } = msg.properties;
  if (replyTo) {
    error = Buffer.from(JSON.stringify(errorResponse));

    channel.publish('', replyTo, error, { correlationId });
    channel.ack(msg);
  } else {
    /* for async messages */
    channel.ack(msg);
    return;
  }
}
