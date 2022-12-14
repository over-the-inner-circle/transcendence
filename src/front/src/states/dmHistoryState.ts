import { atom, selector } from 'recoil';
import type { Friend } from '@/hooks/query/friends';

export interface DmInfo {
  opponent: Friend;
  last_dm: Date;
  last_read?: Date | undefined;
}

export const dmHistoryState = atom<DmInfo[]>({
  key: 'dmHistory',
  default: [],
});

export const sortedDmHistoryState = selector<DmInfo[]>({
  key: 'sortedDmHistory',
  get: ({ get }) => {
    const dmHistory = get(dmHistoryState);
    return dmHistory
      .slice()
      .sort((a, b) => b.last_dm.getTime() - a.last_dm.getTime());
  },
});
