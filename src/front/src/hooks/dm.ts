import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { useQueryClient } from '@tanstack/react-query';
import { dmHistoryState, type DmInfo } from '@/states/dmHistoryState';
import { currentDMOpponentState } from '@/states/currentDMOpponent';
import { currentSideBarItemState } from '@/states/currentSideBarItemState';
import { useSocketRef } from './chat';
import { type Friend } from '@/hooks/query/friends';
import { type Message } from '@/hooks/query/dm';

interface SubscribeData {
  sender: Friend;
  payload: string;
}

export function useDirectMessageSocket(opponent: string) {
  const queryClient = useQueryClient();
  const socketRef = useSocketRef(`ws://${import.meta.env.VITE_BASE_URL}:9992`);
  const setDmHistory = useSetRecoilState(dmHistoryState);

  useEffect(() => {
    const socket = socketRef.current;

    const handleSub = (data: SubscribeData) => {
      queryClient.setQueryData<Message[]>(
        ['dm/messages', opponent],
        (prevMsg) => {
          const newMessage: Message = {
            sender: data.sender,
            payload: data.payload,
            created: new Date().toISOString(),
          };
          return prevMsg ? [...prevMsg, newMessage] : [newMessage];
        },
      );
      setDmHistory((currHistory) =>
        currHistory.map((dmInfo) => {
          if (dmInfo.opponent.nickname === opponent) {
            return { ...dmInfo, last_dm: new Date(), last_read: new Date() };
          }
          return dmInfo;
        }),
      );
    };

    socket.emit('join', { opponent });

    socket.on('subscribe', handleSub);
    socket.on('subscribe_self', handleSub);

    return () => {
      socket.off('subscribe', handleSub);
      socket.off('subscribe_self', handleSub);
    };
  }, [opponent, queryClient, socketRef, setDmHistory]);

  return { socket: socketRef.current };
}

export function useUpdateDmHistory(opponent: Friend | undefined) {
  const setDmHistory = useSetRecoilState(dmHistoryState);

  useEffect(() => {
    if (opponent) {
      setDmHistory((currHistory) => {
        const newHistory: DmInfo = {
          opponent: opponent,
          last_read: new Date(),
          last_dm: new Date(),
        };
        const idx = currHistory.findIndex(
          (dmInfo) => dmInfo.opponent.user_id === opponent.user_id,
        );
        return idx !== -1
          ? [
              ...currHistory.slice(0, idx),
              newHistory,
              ...currHistory.slice(idx + 1),
            ]
          : [...currHistory, newHistory];
      });
    }
  }, [opponent, setDmHistory]);
}

export function useSetCurrentDMOpponent() {
  const setCurrentSideBarItem = useSetRecoilState(currentSideBarItemState);
  const setCurrentDMOpponent = useSetRecoilState(currentDMOpponentState);

  const setCurrentDMOpponentWrapper = (nickname: string) => {
    setCurrentSideBarItem('dm');
    setCurrentDMOpponent(nickname);
  };
  return setCurrentDMOpponentWrapper;
}
