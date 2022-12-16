import { useRecoilValue } from 'recoil';

import { currentGameScore } from '@/states/game/currentGameScore';
import { matchInfo } from '@/states/game/matchInfo';

import Spacer from '@/atom/Spacer';

const LeftPlayerInfo = () => {
  const playerInfo = useRecoilValue(matchInfo);
  const lPlayerProfileImg = playerInfo?.lPlayerInfo.prof_img;

  if (!playerInfo) {
    return null;
  }
  return (
    <div className="flex h-full items-center justify-end px-4">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full`}
      >
        <img
          className={`h-full w-full object-cover`}
          src={
            lPlayerProfileImg
              ? lPlayerProfileImg
              : 'src/assets/default_profile_image.png'
          }
          alt={'user profile'}
        />
      </div>

      <div className="ml-4 flex flex-col items-start justify-center">
        <span>{playerInfo.lPlayerInfo.nickname}</span>
        <span>{playerInfo.lPlayerInfo.mmr}</span>
      </div>
    </div>
  );
};

const RightPlayerInfo = () => {
  const playerInfo = useRecoilValue(matchInfo);
  const rPlayerProfileImg = playerInfo?.rPlayerInfo.prof_img;

  if (!playerInfo) {
    return null;
  }
  return (
    <div className="flex h-full items-center justify-start px-4">
      <div className="mr-4 flex flex-col items-end justify-center">
        <span>{playerInfo.rPlayerInfo.nickname}</span>
        <span>{playerInfo.rPlayerInfo.mmr}</span>
      </div>
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full`}
      >
        <img
          className={`h-full w-full object-cover`}
          src={
            rPlayerProfileImg
              ? rPlayerProfileImg
              : 'src/assets/default_profile_image.png'
          }
          alt={'user profile'}
        />
      </div>
    </div>
  );
};

const ScoreBoard = () => {
  const gameScore = useRecoilValue(currentGameScore);

  return (
    <div className="stop-dragging flex flex-col justify-center whitespace-nowrap text-4xl">
      {gameScore ? gameScore.p1Score : 0} : {gameScore ? gameScore.p2Score : 0}
    </div>
  );
};

const GamePlayerInfoBar = () => {
  return (
    <div className="flex h-24 w-full flex-row bg-neutral-800 font-pixel text-white">
      <LeftPlayerInfo />
      <Spacer />
      <ScoreBoard />
      <Spacer />
      <RightPlayerInfo />
    </div>
  );
};

export default GamePlayerInfoBar;
