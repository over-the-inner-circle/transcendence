import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { useFetcher } from '@/hooks/fetcher';
import { accessTokenState } from '@/states/user/auth';

export interface Friend {
  user_id: string;
  nickname: string;
  prof_img: string;
  state?: 'online' | 'offline' | 'ingame';
  mmr?: number;
  created?: Date;
  deleted?: Date;
}

export interface RequestedFriend {
  request_id: string;
  user_info: Friend;
  created_date: Date;
}

export function useFriends() {
  const fetcher = useFetcher();
  const accessToken = useRecoilValue(accessTokenState);

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['friend/all'],
    queryFn: async (): Promise<Friend[]> => {
      const res = await fetcher('/friend/all');
      if (res.ok) return res.json();
      return [];
    },
    select: (friends) => [
      {
        title: 'online',
        list: friends.filter((friend) => friend.state !== 'offline'),
      },
      {
        title: 'offline',
        list: friends.filter((friend) => friend.state === 'offline'),
      },
    ],
    enabled: !!accessToken,
    refetchOnWindowFocus: false,
  });
  return { friends: data, error, isLoading, isError };
}

export function useRequestedFriends(type: 'sent' | 'recv') {
  const fetcher = useFetcher();
  const data = useQuery({
    queryKey: ['friend/request', type],
    queryFn: async (): Promise<RequestedFriend[]> => {
      const res = await fetcher(`/friend/request/${type}`);
      if (res.ok) return res.json();
      return [];
    },
  });
  return data;
}
