import { useSetRecoilState, useRecoilValue } from 'recoil';

import { currentGameStatus } from '@/states/game/currentGameStatus';
import { gameResult } from '@/states/game/gameResult';

import Button from '@/atom/Button';
import GameMatchedUserInfo from '@/atom/GameMatchedUserInfo';

const GameFinished = () => {
  const result = useRecoilValue(gameResult);
  const setGameStatus = useSetRecoilState(currentGameStatus);

  const toIntro = () => {
    setGameStatus('INTRO');
  };

  if (!result) {
    return null;
  }

  const lPlayerBorderColor = (): string => {
    if (result.winner === result.l_player.nickname) {
      return 'border-green-500';
    } else {
      return 'border-neutral-500';
    }
  };

  const rPlayerBorderColor = (): string => {
    if (result.winner === result.r_player.nickname) {
      return 'border-green-500';
    } else {
      return 'border-neutral-500';
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center font-pixel text-white">
      <span className="text-3xl lg:text-4xl">{'Game Result'}</span>
      <div className="mt-20 mb-8 flex w-full flex-row items-center justify-around">
        <GameMatchedUserInfo
          name={result.l_player.nickname}
          eloScore={result.l_player.mmr}
          imgUri={result.l_player.prof_img}
          borderColor={lPlayerBorderColor()}
        />
        <div className="flex flex-col items-center justify-center gap-12">
          <span className="whitespace-nowrap text-3xl lg:text-5xl">
            {' '}
            {result.l_player.score} : {result.r_player.score}{' '}
          </span>
          <span className="text-xl">
            {result.mode === 'friendly' ? 'Normal' : 'Rank'}
          </span>
        </div>
        <GameMatchedUserInfo
          name={result.r_player.nickname}
          eloScore={result.r_player.mmr}
          imgUri={result.r_player.prof_img}
          borderColor={rPlayerBorderColor()}
        />
      </div>
      <Button className="mt-20 bg-green-600 text-2xl" onClick={toIntro}>
        {' '}
        DONE{' '}
      </Button>
    </div>
  );
};

export default GameFinished;
