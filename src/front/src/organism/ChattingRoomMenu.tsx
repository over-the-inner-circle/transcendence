import { useRecoilValue } from 'recoil';
import { useDeleteRoom, useExitRoom } from '@/hooks/mutation/chat';
import { currentUserInfoState } from '@/states/user/auth';
import { ChattingSideBarProps } from '@/organism/ChatingRoom';
import EditRoomInfoForm from '@/organism/EditRoomInfoForm';
import InviteFriendForm from '@/organism/InviteFriendToChatForm';

function ChattingRoomMenu({
  roomInfo,
  close,
  setSidebarState,
}: ChattingSideBarProps) {
  const currentUserInfo = useRecoilValue(currentUserInfoState);

  const exitRoom = useExitRoom();
  const deleteRoom = useDeleteRoom();
  const menuList = {
    userList: {
      title: 'User List',
      onClick: () => setSidebarState('userList'),
    },
    exit: {
      title: 'Exit',
      className: 'text-red-500',
      onClick: () => {
        if (confirm('Are you sure?')) {
          exitRoom.mutate(roomInfo.room_id);
        }
      },
    },
    delete: {
      title: 'Delete',
      className: 'text-red-500',
      onClick: () => {
        if (confirm('Are you sure?')) {
          deleteRoom.mutate(roomInfo.room_id);
        }
      },
    },
  };

  return (
    <>
      <div
        className="flex h-fit w-full items-center justify-between
                      border-b border-neutral-400 bg-neutral-800 p-3"
      >
        <button onClick={close} className="px-1">
          &lt;
        </button>
        {roomInfo.room_name}
        <p className="h-full w-6 px-1" />
      </div>
      <div className="h-full w-full grow overflow-y-auto border-b border-neutral-400">
        <ul className="flex h-fit w-full flex-col items-start justify-start">
          {currentUserInfo?.user_id === roomInfo.room_owner_id ? (
            <li className="w-full">
              <EditRoomInfoForm roomInfo={roomInfo} />
            </li>
          ) : null}
          <li className="w-full">
            <InviteFriendForm roomInfo={roomInfo} />
          </li>
          <li
            className="flex h-fit w-full items-center justify-between
                        border-b border-neutral-400 bg-neutral-700 p-2 px-5"
          >
            <button onClick={menuList['userList'].onClick}>
              {menuList['userList'].title}
            </button>
          </li>
          {currentUserInfo?.user_id === roomInfo.room_owner_id ? (
            <li
              className="flex h-fit w-full items-center justify-between
                           border-b border-neutral-400 bg-neutral-700 p-2 px-5
                           text-red-500"
            >
              <button onClick={menuList['delete'].onClick}>
                {menuList['delete'].title}
              </button>
            </li>
          ) : null}
          <li
            className="flex h-fit w-full items-center justify-between
                         border-b border-neutral-400 bg-neutral-700 p-2 px-5
                         text-red-500"
          >
            <button onClick={menuList['exit'].onClick}>
              {menuList['exit'].title}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default ChattingRoomMenu;
