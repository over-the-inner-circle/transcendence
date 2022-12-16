import { useSetRecoilState, useRecoilValue } from 'recoil';
import React, { useEffect, useState } from 'react';

import { currentGameStatus } from '@/states/game/currentGameStatus';
import { matchInfo } from '@/states/game/matchInfo';
import { gameTheme } from '@/states/game/gameTheme';
import { gameInitialData } from '@/states/game/gameInitialData';

import GameMatchedUserInfo from '@/atom/GameMatchedUserInfo';
import Button from '@/atom/Button';

import { availablePongThemes } from '@/models/Pong';
import { GameSocketManager } from '@/models/GameSocketManager';

export interface GameInitialData {
  width: number;
  height: number;
  playerHeight: number;
  playerWidth: number;
  ballRadius: number;
  lPlayerX: number;
  rPlayerX: number;
}

const GameMatched = () => {
  const setGameStatus = useSetRecoilState(currentGameStatus);
  const setPongTheme = useSetRecoilState(gameTheme);
  const setGameInitialData = useSetRecoilState(gameInitialData);

  const currentMatchInfo = useRecoilValue(matchInfo);

  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [isReadyButtonClicked, setIsReadyButtonClicked] =
    useState<boolean>(false);
  const [isCounterpartReady, setIsCounterpartReady] = useState<boolean>(false);
  const [gameDifficulty, setGameDifficulty] = useState<number>(2);

  const socketManager = GameSocketManager.getInstance();

  /* useEffects ===============================================================*/

  useEffect(() => {
    // TODO: 에러처리
    if (!currentMatchInfo) {
      setGameStatus('INTRO');
    }

    const socket = socketManager.socket;
    if (!socket) {
      setGameStatus('INTRO');
      return;
    }

    socket.on('difficulty_changed', (changedDifficulty: number) => {
      setGameDifficulty(changedDifficulty);
    });

    socket.on('counterpart_ready', (socketId) => {
      if (!(socketId === socket.id)) {
        setIsCounterpartReady(true);
      }
    });

    socket.once('server_ready_to_start', (data: GameInitialData) => {
      setGameInitialData(data);
      setGameStatus('PLAYING');
    });

    socket.once('user_exit_room', () => {
      socket.emit('user_checkout_room');
      setGameStatus('INTRO');
    });

    return () => {
      socket.removeAllListeners('difficulty_changed');
      socket.removeAllListeners('counterpart_ready');
      socket.removeAllListeners('server_ready_to_start');
      socket.removeAllListeners('user_exit_room');
    };
  }, []);

  /* ==========================================================================*/

  /* event handlers ===========================================================*/

  const playerReady = () => {
    if (!isReadyButtonClicked) {
      setIsPlayerReady(true);
      socketManager.socket?.emit('player_ready');
      setIsReadyButtonClicked(true);
      setTimeout(() => {
        setIsReadyButtonClicked(false);
      }, 1000);
    }
  };

  const changeGameDifficulty = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    difficulty: string,
  ) => {
    const socket = socketManager.socket;
    if (!socket) {
      return;
    }
    switch (difficulty) {
      case 'EASY':
        socket.emit('player_change_difficulty', 1);
        break;
      case 'NORMAL':
        socket.emit('player_change_difficulty', 2);
        break;
      case 'HARD':
        socket.emit('player_change_difficulty', 3);
        break;
    }
  };

  const changeGameTheme = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    themeNumber: number,
  ) => {
    setPongTheme(availablePongThemes()[themeNumber]);
  };

  /* ==========================================================================*/

  /* private functions ========================================================*/

  // room owner === lPlayer

  const lPlayerBorderColor = (): string => {
    if (currentMatchInfo?.owner === socketManager.socket?.id) {
      return isPlayerReady ? 'border-green-600' : 'border-neutral-600';
    } else {
      return isCounterpartReady ? 'border-green-600' : 'border-neutral-600';
    }
  };

  const rPlayerBorderColor = (): string => {
    if (currentMatchInfo?.owner !== socketManager.socket?.id) {
      return isPlayerReady ? 'border-green-600' : 'border-neutral-600';
    } else {
      return isCounterpartReady ? 'border-green-600' : 'border-neutral-600';
    }
  };

  /* sub components ========================================================== */

  const DifficultyButtons = () => {
    return (
      <div className="flex flex-row gap-8">
        <Button
          onClick={(e) => {
            changeGameDifficulty(e, 'EASY');
          }}
          className={`bg-green-400
                           ${
                             gameDifficulty === 1 ? 'ring-4 ring-slate-100' : ''
                           }`}
        >
          easy
        </Button>
        <Button
          onClick={(e) => {
            changeGameDifficulty(e, 'NORMAL');
          }}
          className={`bg-yellow-500
                           ${
                             gameDifficulty === 2 ? 'ring-4 ring-slate-100' : ''
                           }`}
        >
          normal
        </Button>
        <Button
          onClick={(e) => {
            changeGameDifficulty(e, 'HARD');
          }}
          className={`bg-red-500
                           ${
                             gameDifficulty === 3 ? 'ring-4 ring-slate-100' : ''
                           }`}
        >
          hard
        </Button>
      </div>
    );
  };

  const ThemeButtons = () => {
    return (
      <div className="flex flex-row gap-8">
        <Button
          onClick={(e) => {
            changeGameTheme(e, 0);
          }}
          className="focus: bg-neutral-600 ring-slate-100 focus:ring"
        >
          {' '}
          theme1{' '}
        </Button>
        <Button
          onClick={(e) => {
            changeGameTheme(e, 1);
          }}
          className="focus: bg-neutral-600 text-hot-green ring-slate-100 focus:ring"
        >
          {' '}
          theme2{' '}
        </Button>
        <Button
          onClick={(e) => {
            changeGameTheme(e, 2);
          }}
          className="focus: bg-neutral-600 text-hot-pink ring-slate-100 focus:ring"
        >
          {' '}
          theme3{' '}
        </Button>
      </div>
    );
  };

  /* ==========================================================================*/

  /* render ================================================================== */

  if (!currentMatchInfo) {
    return null;
  }
  return (
    <div className="stop-dragging flex h-full w-full flex-col items-center justify-center font-pixel text-white">
      <div className="flex w-full flex-row items-center justify-around max-w-xl">
        <GameMatchedUserInfo
          name={currentMatchInfo.lPlayerInfo.nickname}
          eloScore={currentMatchInfo.lPlayerInfo.mmr}
          imgUri={currentMatchInfo.lPlayerInfo.prof_img}
          borderColor={lPlayerBorderColor()}
        />
        <GameMatchedUserInfo
          name={currentMatchInfo.rPlayerInfo.nickname}
          eloScore={currentMatchInfo.rPlayerInfo.mmr}
          imgUri={currentMatchInfo.rPlayerInfo.prof_img}
          borderColor={rPlayerBorderColor()}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="m-4 mt-10 text-xl">Game settings</span>
        <span className="m-2">Difficulty</span>
        <DifficultyButtons />
        <span className="m-2 mt-6">Theme</span>
        <ThemeButtons />
        <Button className="mt-10 bg-green-700 text-xl" onClick={playerReady}>
          READY
        </Button>
      </div>
    </div>
  );
};

export default GameMatched;
