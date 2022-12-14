import { atom } from 'recoil';

const isEditAccountModalOpenState = atom({
  key: 'isEditAccountModalOpen',
  default: false,
});

export default isEditAccountModalOpenState;
