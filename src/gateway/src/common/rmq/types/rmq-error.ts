export class RmqError {
  public code: number;
  public message: string | string[];
  public where: string;

  constructor(e: RmqError) {
    this.code = e.code;
    this.message = e.message;
    this.where = e.where;
  }
}
