import type { ToastContentProps } from 'react-toastify';
import { Friend } from '@/hooks/query/friends';
import { useFriendRequestAccept } from '@/hooks/mutation/friends';
import Button from '@/atom/Button';

export interface NotificationUserData {
  sender: Friend;
  payload: string;
}

function NotificationUser({
  data,
  closeToast,
}: ToastContentProps<NotificationUserData>) {
  const acceptFriendRequest = useFriendRequestAccept();

  const handleClick = () => {
    if (data?.payload) {
      acceptFriendRequest.mutate(data.payload);
    }
    if (closeToast) closeToast();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-start justify-start whitespace-nowrap pr-3">
        <h2 className="text-sm">Friend request</h2>
        <p>{data?.sender.nickname}</p>
      </div>
      <Button className="break-keep bg-green-500 text-xs" onClick={handleClick}>
        Accept
      </Button>
    </div>
  );
}

export default NotificationUser;
