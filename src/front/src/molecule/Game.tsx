import React, { useRef, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { currentGameScore } from '@/states/game/currentGameScore';
import { currentGameStatus } from '@/states/game/currentGameStatus';
import { gameTheme } from '@/states/game/gameTheme';
import { gameInitialData } from '@/states/game/gameInitialData';
import { gameResult } from '@/states/game/gameResult';

import Pong from '@/models/Pong';
import { GameSocketManager } from '@/models/GameSocketManager';

interface GameRenderData {
  lPlayerY: number;
  lPlayerScore: number;
  rPlayerY: number;
  rPlayerScore: number;
  ballX: number;
  bally: number;
}

export interface GameResultData {
  game_id: string;
  winner: string;
  game_end: string;
  game_start: string;
  difficulty: string;
  mode: string;
  l_player: {
    user_id: string;
    nickname: string;
    prof_img: string | null;
    mmr: number;
    score: number;
  };
  r_player: {
    user_id: string;
    nickname: string;
    prof_img: string | null;
    mmr: number;
    score: number;
  };
}

const Game = () => {
  const didGameStarted = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pongRef = useRef<Pong | null>(null);

  const currentGameTheme = useRecoilValue(gameTheme);
  const initialGameData = useRecoilValue(gameInitialData);
  const [gameStatus, setGameStatus] = useRecoilState(currentGameStatus);
  const [gameScore, setGameScore] = useRecoilState(currentGameScore);
  const setGameResult = useSetRecoilState(gameResult);

  const socketManager = GameSocketManager.getInstance();

  /* useEffects ================================================================= */

  // 게임 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (container && canvas) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    const context = canvas?.getContext('2d');
    if (canvas && context && container && initialGameData) {
      pongRef.current = new Pong(context, currentGameTheme, initialGameData);
      setGameScore({ p1Score: 0, p2Score: 0 });
      if (gameStatus === 'PLAYING') {
        socketManager.socket?.emit('client_ready_to_start');
      } else if (gameStatus === 'WATCHING') {
        socketManager.socket?.emit('client_ready_to_watch');
        didGameStarted.current = true;
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.focus();
    }
  }, [])

  // 윈도우 리사이즈 시 게임 크기 조정
  useEffect(() => {
    window.addEventListener('resize', adjustGameSize);
    return () => {
      window.removeEventListener('resize', adjustGameSize);
    };
  }, []);

  // 소켓 리스너
  useEffect(() => {
    const socket = socketManager.socket;

    if (!socket || !socket.connected) {
      alert('socket is not connected');
      setGameStatus('INTRO');
      return;
    }

    socket.once('game_started', () => {
      didGameStarted.current = true;
    });

    socket.on('game_render_data', (data: GameRenderData) => {
      if (!didGameStarted.current) {
        return;
      }
      if (!pongRef.current) {
        return;
      }
      pongRef.current.updateCurrentPositions({
        p1YPosition: data.lPlayerY,
        p2YPosition: data.rPlayerY,
        ballXPosition: data.ballX,
        ballYPosition: data.bally,
      });
      pongRef.current.render();
      if (
        data.lPlayerScore !== gameScore.p1Score ||
        data.rPlayerScore !== gameScore.p2Score
      ) {
        setGameScore({
          p1Score: data.lPlayerScore,
          p2Score: data.rPlayerScore,
        });
      }
    });

    socket.once('game_finished', () => {
      // 게임 종료
      socket.emit('save_game_data');
    });

    socket.once('saved_game_data', () => {
      socket.emit('user_leave_room');
    });

    socket.once('game_result', (data: GameResultData) => {
      setGameResult(data);
      setGameStatus('FINISHED');
    });

    return () => {
      socket.removeAllListeners('game_started');
      socket.removeAllListeners('game_render_data');
      socket.removeAllListeners('game_finished');
      socket.removeAllListeners('saved_game_data');
      socket.removeAllListeners('game_result');
    };
  }, [gameScore]);

  /* ============================================================================ */

  /* Event Handlers ============================================================= */

  const adjustGameSize = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (container && canvas) {
      canvas.height = container.clientHeight;
      canvas.width = container.clientWidth;
    }
    pongRef.current?.adjustAfterResize();
    pongRef.current?.render();
  };

  const handleKeyPress = (event: React.KeyboardEvent, type: string) => {
    const socket = socketManager.socket;

    if (!socket || !socket.connected || gameStatus !== 'PLAYING') {
      return;
    }
    const key = event.key;
    if (key === 'ArrowUp' && type === 'keyDown') {
      socket.emit('up_key_pressed');
    } else if (key === 'ArrowDown' && type === 'keyDown') {
      socket.emit('down_key_pressed');
    } else if (key === 'ArrowUp' && type === 'keyUp') {
      socket.emit('up_key_released');
    } else if (key === 'ArrowDown' && type === 'keyUp') {
      socket.emit('down_key_released');
    }
  };

  /* ========================================================================== */

  /* Render =================================================================== */

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas
        className="outline-none"
        tabIndex={0}
        ref={canvasRef}
        onKeyDown={(event) => handleKeyPress(event, 'keyDown')}
        onKeyUp={(event) => handleKeyPress(event, 'keyUp')}
      />
    </div>
  );
};

export default Game;
