import { useNavigate } from 'react-router-dom';
import { accessTokenState } from '@/states/user/auth';
import { useSetRecoilState } from 'recoil';
import { toast } from 'react-toastify';

export const isValidNickname = (nickname: string): boolean => {
  if (
    nickname.length > 1 &&
    nickname.length < 17 &&
    nickname.match(/^[a-zA-Z0-9가-힣_]+$/)
  ) {
    return true;
  }
  toast.error('Invalid nickname');
  return false;
};

export function useLogOut() {
  const navigate = useNavigate();
  const setAccessToken = useSetRecoilState(accessTokenState);

  const logOut = () => {
    setAccessToken(null);
    window.localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return logOut;
}
