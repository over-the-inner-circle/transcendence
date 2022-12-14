import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export enum UserState {
  ONLINE = 'online',
  INGAME = 'ingame',
  OFFLINE = 'offline',
}
export type TwoFactorAuthenticationType = 'google';

export class TwoFactorAuthenticationInfo {
  @IsString()
  type: string;

  @IsString()
  key: string;
}

export class UserProfile {
  @Expose()
  user_id: string;

  @Expose()
  nickname: string;

  @Expose()
  prof_img: string;

  @Expose()
  mmr: number;

  @Expose()
  created: Date;

  @Expose()
  deleted: Date;
  state?: UserState;
}

export class UserInfo {
  user_id: string;
  nickname: string;
  provider: string;
  third_party_id: string;
  two_factor_authentication_key: string;
  two_factor_authentication_type: string;
  is_two_factor_authentication_enabled: boolean;
  prof_img: string;
  mmr: number;
  created: Date;
  deleted: Date;
  state?: UserState;
}
