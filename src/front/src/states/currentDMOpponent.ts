import { atom } from 'recoil';

export const currentDMOpponentState = atom<string | null>({
  key: 'currentDMOpponent',
  default: null,
});
