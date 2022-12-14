import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export type TwoFactorAuthenticationType = 'google';
export class TwoFactorAuthenticationInfo {
  @Expose()
  @IsString()
  type: string;
  @Expose()
  @IsString()
  key: string;
}
