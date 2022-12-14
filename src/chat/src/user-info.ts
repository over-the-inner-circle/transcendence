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
  @Expose()
  state?: UserState;
}

export class UserInfo {
  @Expose()
  user_id: string;
  @Expose()
  nickname: string;
  @Expose()
  provider: string;
  @Expose()
  third_party_id: string;
  @Expose()
  two_factor_authentication_key: string;
  @Expose()
  two_factor_authentication_type: string;
  @Expose()
  prof_img: string;
  @Expose()
  mmr: number;
  @Expose()
  created: Date | string;
  @Expose()
  deleted: Date | string;
  @Expose()
  state?: UserState;
}
