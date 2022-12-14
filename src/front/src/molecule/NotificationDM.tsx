import type { ToastContentProps } from 'react-toastify';
import type { Friend } from '@/hooks/query/friends';
import { useSetCurrentDMOpponent } from '@/hooks/dm';

export interface NotificationDMData {
  sender: Friend;
  payload: string;
}

function NotificationDM({
  data,
  closeToast,
}: ToastContentProps<NotificationDMData>) {
  const setCurrentDMOpponent = useSetCurrentDMOpponent();

  const handleClick = () => {
    if (data?.sender) {
      setCurrentDMOpponent(data.sender.nickname);
    }
    if (closeToast) closeToast();
  };

  return (
    <button
      className="flex w-full flex-col items-start justify-center whitespace-nowrap"
      onClick={handleClick}
    >
      <p>
        <strong>{data?.sender.nickname ?? '???'}</strong>: {data?.payload}
      </p>
    </button>
  );
}

export default NotificationDM;
