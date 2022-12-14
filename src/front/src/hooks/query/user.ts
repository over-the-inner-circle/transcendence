import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accessTokenState, UserInfo } from '@/states/user/auth';
import { refreshAccessToken } from '@/hooks/fetcher';
import { useFetcher } from '@/hooks/fetcher';
import { Friend } from '@/hooks/query/friends';

export function useCurrentUser() {
  const fetcher = useFetcher();
  const accessToken = useRecoilValue(accessTokenState);
  const data = useQuery<UserInfo>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetcher('/user');
      if (res.ok) return res.json();
      throw res;
    },
    enabled: !!accessToken,
  });
  return data;
}

export function useUserInfo(nickname: string) {
  const fetcher = useFetcher();
  const data = useQuery<UserInfo>({
    queryKey: ['user', nickname],
    queryFn: async () => {
      const res = await fetcher(`/user/${nickname}`);

      if (res.ok) return res.json();
      throw res;
    },
    retry: false,
  });

  return data;
}

export interface BlockData {
  block_id: string;
  blocker: Friend;
  blocked: Friend | null;
  created_date: Date;
}

export function useBlockedFriends() {
  const fetcher = useFetcher();
  const data = useQuery({
    queryKey: ['block'],
    queryFn: async (): Promise<BlockData[]> => {
      const res = await fetcher('/block/list');
      if (res.ok) {
        const { block_list } = await res.json();
        return block_list;
      }
      return [];
    },
  });
  return data;
}

interface RefreshData {
  access_token: string;
  refresh_token: string;
}

export function useRefreshToken() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);

  useQuery<RefreshData>({
    queryKey: ['auth/refresh'],
    queryFn: async () => {
      const res = await refreshAccessToken();

      if (res?.ok) return res.json();
      throw res;
    },
    onSuccess: (data) => {
      if (data.access_token) {
        setAccessToken(data.access_token);
        window.localStorage.setItem('refresh_token', data.refresh_token);
      } else {
        throw data;
      }
    },
    onError: (err) => {
      if (err instanceof Response) {
        if (err.status === 401) {
          toast.error('session is expired');
          navigate('/');
        }
      }
    },
    retry: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 3500 * 1000,
  });

  return accessToken;
}
