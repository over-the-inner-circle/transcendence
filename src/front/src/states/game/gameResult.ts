import { atom } from 'recoil';
import { GameResultData } from '@/molecule/Game';

export const gameResult = atom<GameResultData | null>({
  key: 'gameResult',
  default: null,
});
