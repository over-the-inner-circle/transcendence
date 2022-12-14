import { atom } from 'recoil';
import { GameStatus } from '@/templates/GameContainer';

export const currentGameStatus = atom<GameStatus>({
  key: 'currentGameStatus',
  default: 'INTRO',
});
