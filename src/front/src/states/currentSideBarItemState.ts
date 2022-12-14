import { atom } from 'recoil';

export type SideBarItem = 'chat' | 'friend' | 'dm';

export const currentSideBarItemState = atom<SideBarItem>({
  key: 'currentSideBarItem',
  default: 'friend',
});
