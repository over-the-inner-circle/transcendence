import { UserProfile } from '../../../user/types/user-profile';

export interface DMFormat {
  payload: string;
}

export class DMFromClient implements DMFormat {
  opponent: string;
  payload: string;
}

export class DMFromServer implements DMFormat {
  constructor(readonly sender: UserProfile, readonly payload: string) {}
}
