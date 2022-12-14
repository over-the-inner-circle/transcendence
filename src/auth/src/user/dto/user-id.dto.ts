import { IsUUID } from 'class-validator';

export class UserIdDto {
  @IsUUID()
  user_id: string;
}
