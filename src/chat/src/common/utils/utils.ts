import { plainToInstance } from 'class-transformer';
import { UserInfo, UserProfile } from '../../user-info';

export function toUserProfile(user: UserInfo): UserProfile {
  return plainToInstance(UserProfile, user, {
    excludeExtraneousValues: true,
  });
}
