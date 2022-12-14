import { useSetRecoilState } from 'recoil';
import { currentSideBarItemState } from '@/states/currentSideBarItemState';
import type { ToastContentProps } from 'react-toastify';
import { RoomInfo, roomInfoState } from '@/states/roomInfoState';
import type { Friend } from '@/hooks/query/friends';

export interface NotificationChatData {
  sender: Friend;
  room_info: RoomInfo;
}

function NotificationChat({
  data,
  closeToast,
}: ToastContentProps<NotificationChatData>) {
  const setCurrentSideBarItem = useSetRecoilState(currentSideBarItemState);
  const setRoomInfo = useSetRecoilState(roomInfoState);

  const handleClick = () => {
    setCurrentSideBarItem('chat');
    setRoomInfo(data?.room_info ?? null);
    if (closeToast) closeToast();
  };

  return (
    <button className="flex items-center justify-between" onClick={handleClick}>
      <div className="flex flex-col items-start justify-start whitespace-nowrap pr-3">
        <h2 className="text-sm">Invited to the Chat</h2>
        <p>{data?.room_info.room_name}</p>
      </div>
    </button>
  );
}

export default NotificationChat;
