import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/*
 @ routing key will be event type
 @ ex) event.on.<service name>.<event type>[.additional.param].rk
 */
export class RmqEvent<T = any> {
  @IsString({ each: true })
  recvUsers: string[];

  @IsNotEmpty()
  data: T;

  @IsOptional()
  created: Date;

  constructor(data: T, recvUsers: string[] = null) {
    this.data = data;
    this.recvUsers = recvUsers;
    this.created = new Date();
  }
}
