import { atom } from 'recoil';

export interface SignUpUserInfo {
  provider: string;
  third_party_id: string;
  prof_img?: string;
  locale?: string;
}

export const signUpUserInfoState = atom<SignUpUserInfo | null>({
  key: 'signupUserInfo',
  default: null,
});
