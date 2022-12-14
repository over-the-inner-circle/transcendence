import { UserProfile } from '../../user/types/user-profile';
import { NotificationFormat } from './notification.format';

export class NotificationFromUser implements NotificationFormat {
  type: string;
  data: {
    sender: UserProfile;
  };

  constructor(
    type: string,
    data: {
      sender: UserProfile;
    },
  ) {
    this.type = type;
    this.data = data;
  }
}
