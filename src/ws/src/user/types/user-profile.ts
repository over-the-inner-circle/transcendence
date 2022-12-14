import { Expose } from 'class-transformer';
import { UserState } from './user-info';

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
