import { useRecoilState, useSetRecoilState } from 'recoil';
import { currentGameStatus } from '@/states/game/currentGameStatus';
import { gameInitialData } from '@/states/game/gameInitialData';
import { matchInfo } from '@/states/game/matchInfo';
import { GameSocketManager } from '@/models/GameSocketManager';
import { MatchInfo } from '@/molecule/GameOnMatching';
import { useFetcher } from '@/hooks/fetcher';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/query/user';

export const useRequestWatchGame = () => {
  const [gameStatus, setGameStatus] = useRecoilState(currentGameStatus);
  const setGameInitialData = useSetRecoilState(gameInitialData);
  const setMatchInfo = useSetRecoilState(matchInfo);

  return (player: string) => {
    if (gameStatus !== 'INTRO') {
      toast.error('You cannot watch game now');
      return;
    }
    const socket = GameSocketManager.getInstance().socket;
    if (!socket) {
      return;
    }
    socket.emit('watch_game', player);
    socket.once('watch_game_ready_to_start', (data) => {
      if (data) {
        setMatchInfo(data.gameInfo);
        setGameInitialData(data.renderInfo);
        setGameStatus('WATCHING');
      }
    });
  };
};

export const useRequestNormalGame = () => {
  const [gameStatus, setGameStatus] = useRecoilState(currentGameStatus);
  const setMatchInfo = useSetRecoilState(matchInfo);
  const fetcher = useFetcher();
  const currentUser = useCurrentUser();

  const waitNormalGameMatched = (player: string) => {
    const socket = GameSocketManager.getInstance().socket;

    if (!socket) return;
    toast.success('Invitation is successfully sent');
    socket.emit('user_create_friendly_room', player);
    socket.once('user_joined_room', (data: MatchInfo) => {
      if (data) {
        setMatchInfo(data);
        setGameStatus('MATCHED');
      }
    });
  };

  useEffect(() => {
    return () => {
      const socket = GameSocketManager.getInstance().socket;
      if (!socket) return;
      socket.removeAllListeners('user_joined_room');
    };
  }, []);

  return (player: string) => {
    if (gameStatus !== 'INTRO') {
      toast.error('You cannot request game now');
      return;
    }
    if (currentUser.data?.nickname === player) {
      toast.error('You cannot invite yourself');
      return;
    }
    // 알림 발송
    const result = fetcher(`/game/invitation/${player}`);
    result.then((res) => {
      if (res.ok) {
        waitNormalGameMatched(player);
      } else {
        toast.error('Invitation is failed');
        res.json().then((data) => {
        });
      }
    });
  };
};

export const useAcceptNormalGameInvitation = () => {
  const setGameStatus = useSetRecoilState(currentGameStatus);
  const setMatchInfo = useSetRecoilState(matchInfo);

  useEffect(() => {
    return () => {
      const socket = GameSocketManager.getInstance().socket;
      if (socket) {
        socket.removeAllListeners('user_joined_room');
      }
    };
  });

  return (player: string) => {
    const socket = GameSocketManager.getInstance().socket;
    if (!socket) {
      toast.error('Invitation is failed');
      return;
    }
    socket.emit('user_join_friendly_room', player);
    socket.once('user_joined_room', (data: MatchInfo) => {
      if (data) {
        setMatchInfo(data);
        setGameStatus('MATCHED');
      }
    });
  };
};
