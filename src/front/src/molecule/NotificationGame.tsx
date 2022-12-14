import Button from '@/atom/Button';
import type { ToastContentProps } from 'react-toastify';
import { useAcceptNormalGameInvitation } from '@/hooks/game';

export interface GameInvitationData {
  sender: {
    created: string;
    deleted: string | null;
    mmr: number;
    nickname: string;
    prof_img: string;
    user_id: string;
  };
}

function NotificationGame({
  data,
  closeToast,
}: ToastContentProps<GameInvitationData>) {
  const acceptInvitation = useAcceptNormalGameInvitation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-start justify-start whitespace-nowrap pr-3">
        <h2 className="text-sm">Invited Game</h2>
        <p>{data?.sender.nickname}</p>
      </div>
      <Button
        className="break-keep bg-green-500 text-xs"
        onClick={() => {
          if (data) {
            acceptInvitation(data.sender.nickname);
          }
          if (closeToast) closeToast();
        }}
      >
        Play
      </Button>
    </div>
  );
}

export default NotificationGame;
