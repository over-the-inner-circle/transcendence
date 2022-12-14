import { atom } from 'recoil';
import { PongTheme, availablePongThemes } from '@/models/Pong';

export const gameTheme = atom<PongTheme>({
  key: 'gameTheme',
  default: availablePongThemes()[0],
});
