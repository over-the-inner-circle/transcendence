import { Expose } from 'class-transformer';

export enum UserState {
  ONLINE = 'online',
  INGAME = 'ingame',
  OFFLINE = 'offline',
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
  created: Date | string;
  @Expose()
  deleted: Date | string;

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
  created: Date | string;
  deleted: Date | string;
  state?: UserState;
}
