import Spinner from '@/atom/Spinner';
import {
  HistoryUser,
  MatchHistory,
  useMatchHistory,
} from '@/hooks/query/matchHistory';

interface UserMatchHistoryProps {
  nickname: string;
}

function getPlayTime(matchInfo: MatchHistory) {
  const playTime =
    (Date.parse(matchInfo.game_end) - Date.parse(matchInfo.game_start)) / 1000;
  const min = Math.floor(playTime / 60)
    .toString()
    .padStart(2, '0');
  const sec = (playTime % 60).toString().padStart(2, '0');

  return `${min}:${sec}`;
}

function UserMatchHistory({ nickname }: UserMatchHistoryProps) {
  const { data: history, isError, isLoading } = useMatchHistory(nickname);

  return (
    <div className="pt-8">
      <div className="py-5 text-lg">Recent matches</div>
      {isError || isLoading ? (
        <div className="pb-8">
          <Spinner />
        </div>
      ) : history.length === 0 ? (
        <div className='py-8'>no result</div>
      ) : (
        <ul className="w-full">
          {history.map((matchInfo) => (
            <li key={matchInfo.game_id} className="flex w-full flex-col pb-8">
              <div className="flex w-full flex-row gap-3 text-xs">
                <p>{new Date(matchInfo.game_start).toLocaleDateString()}</p>
                <p>({getPlayTime(matchInfo)})</p>
              </div>
              <p className="text-xs">{matchInfo.mode}</p>
              <div className="flex flex-row items-center justify-center py-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <UserLabel
                    user={matchInfo.l_player}
                    winner={matchInfo.winner}
                    isLeft={true}
                  />
                  <p className="flex w-14 items-center justify-end pr-5 text-2xl">
                    {matchInfo.l_player?.score ?? 0}
                  </p>
                </div>
                <p className="flex items-center justify-center">:</p>
                <div className="flex w-full flex-row items-center justify-between">
                  <p className="flex w-14 items-center justify-start pl-5 text-2xl">
                    {matchInfo.r_player?.score ?? 0}
                  </p>
                  <UserLabel
                    user={matchInfo.r_player}
                    winner={matchInfo.winner}
                    isLeft={false}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface UserLabelProps {
  user: HistoryUser | null;
  winner: string;
  isLeft: boolean;
}

function UserLabel({ user, winner, isLeft }: UserLabelProps) {
  return (
    <div
      className={`flex flex-col justify-center ${
        isLeft ? 'items-start' : 'items-end'
      }`}
    >
      <p>{user?.nickname ?? 'unknown'}</p>
      <p className="text-xs">{winner === user?.nickname ? 'win' : 'lose'}</p>
    </div>
  );
}

export default UserMatchHistory;
