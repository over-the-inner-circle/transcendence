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
      <div
        className={`mb-4 flex h-24 w-24 items-center justify-center overflow-hidden
                    rounded-full border-4 border-solid
                    lg:h-36 lg:w-36 lg:border-8 ${info.borderColor}`}
      >
        <img
          className="h-full w-full object-cover"
          src={
            info.imgUri ? info.imgUri : 'src/assets/default_profile_image.png'
          }
          alt={'user profile'}
        />
      </div>
      <span>{info.name}</span>
      <span>{info.eloScore}</span>
    </div>
  );
};

export default GameMatchedUserInfo;
