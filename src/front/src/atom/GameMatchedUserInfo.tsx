import Circle from '@/atom/Circle';

export interface MatchedUserInfoProps {
  name: string;
  eloScore: number;
  borderColor: string;
  imgUri: string | null;
  className?: string;
}

const GameMatchedUserInfo = (info: MatchedUserInfoProps) => {
  return (
    <div className={`flex shrink-0 flex-col items-center ${info.className}`}>
      <img
        className={`object-fit mb-4 h-36 w-36 rounded-full border-8 border-solid ${info.borderColor}`}
        src={info.imgUri ? info.imgUri : 'src/assets/default_profile_image.png'}
        alt={'user profile'}
      />
      <span>{info.name}</span>
      <span>{info.eloScore}</span>
    </div>
  );
};

export default GameMatchedUserInfo;
