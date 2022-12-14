import { plainToInstance } from 'class-transformer';
import { UserInfo } from '../../user/types/user-info';
import { UserProfile } from '../../user/types/user-profile';

export function toUserProfile(user: UserInfo): UserProfile {
  return plainToInstance(UserProfile, user, {
    excludeExtraneousValues: true,
  });
}
