import { useSetRecoilState } from 'recoil';
import { useEffect } from 'react';

import Button from '@/atom/Button';

import { currentGameStatus } from '@/states/game/currentGameStatus';
import { matchInfo } from '@/states/game/matchInfo';
import { GameSocketManager } from '@/models/GameSocketManager';

export interface MatchedUserInfo {
  user_id: string;
  nickname: string;
  prof_img: string | null;
  mmr: number;
}

export interface MatchInfo {
  owner: string;
  lPlayerInfo: MatchedUserInfo;
  rPlayerInfo: MatchedUserInfo;
}

const GameOnMatching = () => {
  const socketManager = GameSocketManager.getInstance();
  const setGameStatus = useSetRecoilState(currentGameStatus);
  const setMatchedPlayerInfo = useSetRecoilState(matchInfo);

  useEffect(() => {
    const socket = socketManager.socket;
    if (!socket) {
      return;
    }

    //TODO: 에러처리
    socket.once('player_matched', (data: string) => {
      socket.emit('user_join_room', data);
    });

    socket.once('user_joined_room', (data: MatchInfo) => {
      setMatchedPlayerInfo(data);
      setGameStatus('MATCHED');
    });

    socket.once('user_exit_room', () => {
      setGameStatus('INTRO');
    });

    return () => {
      socket.removeAllListeners('player_matched');
      socket.removeAllListeners('user_joined_room');
      socket.removeAllListeners('user_exit_room');
    };
  }, []);

  const cancelMatching = () => {
    socketManager.socket?.emit('user_left_queue');
    setGameStatus('INTRO');
  };

  return (
    <div className="stop-dragging flex h-full w-full flex-col items-center justify-center">
      <span className="font-pixel text-2xl text-white">Matching...</span>
      <Button
        onClick={cancelMatching}
        className="mt-10 bg-red-500 font-pixel text-white"
      >
        cancel
      </Button>
    </div>
  );
};

export default GameOnMatching;
