import { atom } from 'recoil';
import { GameInitialData } from '@/molecule/GameMatched';

export const gameInitialData = atom<GameInitialData | null>({
  key: 'gameInitialData',
  default: null,
});
