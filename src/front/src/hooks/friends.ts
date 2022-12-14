import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketRef } from '@/hooks/chat';
import { Friend } from '@/hooks/query/friends';

export function useFriendsStatusSocket() {
  const socketRef = useSocketRef(`ws://${import.meta.env.VITE_BASE_URL}:9994`);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNoti = (data: {
      user: string;
      state: 'online' | 'offline' | 'ingame';
    }) => {
      queryClient.setQueryData(['friend/all'], (prevFriends?: Friend[]) => {
        return prevFriends
          ? prevFriends.map((friend) =>
              friend.user_id === data.user
                ? { ...friend, state: data.state }
                : friend,
            )
          : undefined;
      });
    };

    const socket = socketRef.current;

    socket.on('update', handleNoti);

    return () => {
      socket.off('update', handleNoti);
    };
  }, [socketRef, queryClient]);
}
