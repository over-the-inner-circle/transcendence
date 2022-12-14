import { Expose } from 'class-transformer';

export class TwoFactorAuthenticationInfo {
  @Expose()
  type: string;
  @Expose()
  key: string;
}
