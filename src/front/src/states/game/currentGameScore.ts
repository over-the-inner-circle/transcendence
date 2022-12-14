import { atom } from 'recoil';

interface CurrentGameScore {
  p1Score: number;
  p2Score: number;
}

export const currentGameScore = atom<CurrentGameScore>({
  key: 'currentGameScore',
  default: {
    p1Score: 0,
    p2Score: 0,
  },
});
