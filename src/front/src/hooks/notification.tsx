import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketRef } from '@/hooks/chat';
import { toast, ToastContentProps } from 'react-toastify';
import { dmHistoryState } from '@/states/dmHistoryState';
import { currentGameStatus } from '@/states/game/currentGameStatus';
import NotificationGame, {
  GameInvitationData,
} from '@/molecule/NotificationGame';
import NotificationChat from '@/molecule/NotificationChat';
import NotificationDM, { NotificationDMData } from '@/molecule/NotificationDM';
import NotificationUser, {
  NotificationUserData,
} from '@/molecule/NotificationUser';
import { NotificationChatData } from '@/molecule/NotificationChat';
import { currentDMOpponentState } from '@/states/currentDMOpponent';

interface NotificationResponse<T extends object> {
  type: string;
  data: T;
}

export function useNotification() {
  const socketRef = useSocketRef(`ws://${import.meta.env.VITE_BASE_URL}:1234`);
  const queryClient = useQueryClient();
  const setDmHistory = useSetRecoilState(dmHistoryState);
  const currentOpponent = useRecoilValue(currentDMOpponentState);
  const gameStatus = useRecoilValue(currentGameStatus);

  useEffect(() => {
    const socket = socketRef.current;
    const handleGame = ({ data }: NotificationResponse<GameInvitationData>) => {
      if (gameStatus !== 'INTRO') return;
      toast(
        (props: ToastContentProps<GameInvitationData>) => (
          <NotificationGame {...props} />
        ),
        {
          autoClose: false,
          toastId: `invite-game-${data.sender.nickname}`,
          data,
        },
      );
    };
    const handleChat = ({
      data,
    }: NotificationResponse<NotificationChatData>) => {
      queryClient.invalidateQueries({ queryKey: ['chat/rooms'] });
      toast(
        (props: ToastContentProps<NotificationChatData>) => (
          <NotificationChat {...props} />
        ),
        {
          data,
        },
      );
    };
    const handleDM = ({ data }: NotificationResponse<NotificationDMData>) => {
      // 최근 DM목록 업데이트
      setDmHistory((currHistory) =>
        currHistory.find(
          (dmInfo) => dmInfo.opponent.user_id === data.sender.user_id,
        )
          ? currHistory
          : [...currHistory, { opponent: data.sender, last_dm: new Date() }],
      );

      if (currentOpponent !== data.sender.nickname) {
        toast(
          (props: ToastContentProps<NotificationDMData>) => (
            <NotificationDM {...props} />
          ),
          {
            data,
          },
        );
      }
    };

    const handleUser = ({
      data,
    }: NotificationResponse<NotificationUserData>) => {
      toast(
        (props: ToastContentProps<NotificationUserData>) => (
          <NotificationUser {...props} />
        ),
        {
          data,
        },
      );
    };

    socket.on('notification-game', handleGame);
    socket.on('notification-chat', handleChat);
    socket.on('notification-dm', handleDM);
    socket.on('notification-user', handleUser);

    return () => {
      socket.off('notification-game', handleGame);
      socket.off('notification-chat', handleChat);
      socket.off('notification-dm', handleDM);
      socket.off('notification-user', handleUser);
    };
  }, [queryClient, socketRef, setDmHistory, currentOpponent, gameStatus]);
}
