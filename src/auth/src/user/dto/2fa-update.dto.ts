import { Expose, Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { TwoFactorAuthenticationInfo } from '../types/two-factor-authentication-info';

export class TwoFactorAuthenticationUpdateDto {
  @Expose()
  @IsUUID()
  user_id: string;

  @Expose()
  @ValidateNested()
  @Type(() => TwoFactorAuthenticationInfo)
  info: TwoFactorAuthenticationInfo;
}
