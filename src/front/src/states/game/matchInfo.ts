import { atom } from 'recoil';
import { MatchInfo } from '@/molecule/GameOnMatching';

export const matchInfo = atom<MatchInfo | null>({
  key: 'matchInfo',
  default: null,
});
