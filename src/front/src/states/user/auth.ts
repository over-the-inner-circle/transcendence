import { atom, selector } from 'recoil';

export const accessTokenState = atom<string | null>({
  key: 'accessToken',
  default: null,
});

export interface UserInfo {
  user_id: string;
  nickname: string;
  provider: string;
  third_party_id: string;
  prof_img: string;
  mmr: number;
  two_factor_authentication_type?: string;
  two_factor_authentication_key?: string;
  is_two_factor_authentication_enabled: boolean;
  created: Date;
  deleted?: Date;
}

export const currentUserInfoState = selector<UserInfo | null>({
  key: 'currentUserInfo',
  get: ({ get }) => {
    const accessToken = get(accessTokenState);
    if (!accessToken) return null;
    return parseJwt(accessToken);
  },
});

function parseJwt(token: string): UserInfo {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );

  return JSON.parse(jsonPayload);
}
