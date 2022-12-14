import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class MessageType {
  @Expose()
  @IsUUID()
  sender_id: string;
  @Expose()
  @IsString()
  payload: string;
  @IsOptional()
  created: string;
}

export class ChatRoomMessageDto {
  @Expose()
  @IsUUID()
  room_id: string;

  @Expose()
  // @ValidateNested({ each: true })
  @ValidateNested()
  @Type(() => MessageType)
  message: MessageType;
}
