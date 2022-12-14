import { atom } from 'recoil';

export interface TwoFaGenData {
  otp_auth_url: string;
  info: {
    type: string;
    key: string;
  };
}

export const twoFAGenDataState = atom<TwoFaGenData | null>({
  key: 'twoFAGenDataState',
  default: null,
});
