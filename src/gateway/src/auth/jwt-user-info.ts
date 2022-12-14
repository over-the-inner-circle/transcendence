import { Expose } from 'class-transformer';
import { UserState } from '../user/user-info';

export class JwtUserInfo {
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
  state?: UserState;
  @Expose()
  grant?: boolean;
}
