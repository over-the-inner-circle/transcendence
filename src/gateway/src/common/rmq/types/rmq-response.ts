import { RmqError } from './rmq-error';

export class RmqResponse<T = object> {
  data: T | null;
  error: RmqError | null;
  created: string;

  constructor(payload: any, readonly success: boolean = true) {
    this.created = Date.now().toString();
    this.data = this.error = null;
    success ? (this.data = payload) : (this.error = payload);
    console.log(this.error instanceof RmqError);
  }
}
