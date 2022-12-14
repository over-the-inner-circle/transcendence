import { atom } from 'recoil';

export const isEnable2FaModalOpenState = atom({
  key: 'isEnable2FaModalOpenState',
  default: false,
});

export const isDisable2FaModalOpenState = atom({
  key: 'isDisable2FaModalOpenState',
  default: false,
});
