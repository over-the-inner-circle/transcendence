import { useRecoilState, useRecoilValue } from 'recoil';
import { useEffect } from 'react';

import { currentGameStatus } from '@/states/game/currentGameStatus';
import { accessTokenState } from '@/states/user/auth';

import GameWindow from '@/organism/GameWindow';
import GameOnMatching from '@/molecule/GameOnMatching';
import GameMatched from '@/molecule/GameMatched';
import GameIntro from '@/molecule/GameIntro';
import GameFinished from '@/molecule/GameFinished';

import { GameSocketManager } from '@/models/GameSocketManager';
import { toast } from 'react-toastify';

export type GameStatus =
  | 'INTRO'
  | 'ON_MATCHING'
  | 'MATCHED'
  | 'PLAYING'
  | 'WATCHING'
  | 'FINISHED';

const GameContainer = () => {
  const [currentStatus, setCurrentStatus] = useRecoilState(currentGameStatus);

  const API_URL = import.meta.env.VITE_BASE_URL;

  const gameSocketUri = `ws://${API_URL}:9998`;
  const accessToken = useRecoilValue(accessTokenState);

  const gameSocketManager = GameSocketManager.getInstance();

  useEffect(() => {
    if (accessToken) {
      gameSocketManager.initSocket(gameSocketUri, accessToken);
    }
    return () => {
      gameSocketManager.socket?.disconnect();
    };
  }, [accessToken]);

  //최초 소켓연결
  useEffect(() => {
    // socket should be initiated before using;
    const gameSocket = gameSocketManager.socket;
    if (gameSocket) {

      gameSocket.on('disconnect', () => {
        toast.error(
          'lost connection to the game server.\nplease refresh the page',
        );
        setCurrentStatus('INTRO');
      });

      gameSocket.on('game_error', (error: string) => {
        toast.error(error);
      });
    }

    return () => {
      gameSocket?.removeAllListeners();
    };
  }, [gameSocketManager, accessToken]);

  return (
    <div className="flex h-full w-full flex-col bg-neutral-900">
      {
        {
          INTRO: <GameIntro />,
          ON_MATCHING: <GameOnMatching />,
          MATCHED: <GameMatched />,
          PLAYING: <GameWindow />,
          WATCHING: <GameWindow />,
          FINISHED: <GameFinished />,
        }[currentStatus]
      }
    </div>
  );
};

export default GameContainer;
