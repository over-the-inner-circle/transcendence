import { Expose } from 'class-transformer';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export enum ChatUserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class ChatUserRoleDto {
  room_id: string;
  room_owner_id: string;

  @Expose()
  @IsUUID()
  user_id: string;

  @Expose()
  @IsEnum(ChatUserRole)
  role: ChatUserRole;
}
