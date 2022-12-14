import { useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';

import Button from '@/atom/Button';
import { currentGameStatus } from '@/states/game/currentGameStatus';
import { GameSocketManager } from '@/models/GameSocketManager';

const GameIntro = () => {
  const setGameStatus = useSetRecoilState(currentGameStatus);
  const socketManager = GameSocketManager.getInstance();
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      socketManager.socket?.removeAllListeners('user_is_in_queue');
    };
  }, []);

  const startMatching = () => {
    const socket = socketManager.socket;
    if (!socket) {
      return;
    }
    if (socket.disconnected) {
      socket.connect();
    }
    if (!isButtonClicked) {
      socket.emit('user_join_queue');
      socket.once('user_is_in_queue', () => {
        setGameStatus('ON_MATCHING');
      });
      setIsButtonClicked(true);
      setTimeout(() => {
        setIsButtonClicked(false);
      }, 1000);
    }
  };

  return (
    <div className="stop-dragging flex h-full w-full items-center justify-center bg-neutral-700">
      {!isButtonClicked ? (
        <Button
          className="bg-green-600 font-pixel text-2xl text-white drop-shadow-xl"
          onClick={startMatching}
        >
          Start Game
        </Button>
      ) : (
        <span className="font-pixel text-white">Please wait a sec...</span>
      )}
    </div>
  );
};

export default GameIntro;
