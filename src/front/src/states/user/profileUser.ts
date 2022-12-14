import { atom } from 'recoil';

export const profileUserState = atom<string | null>({
  key: 'profileUser',
  default: null,
});
