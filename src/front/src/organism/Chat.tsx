import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { toast } from 'react-toastify';
import { RoomInfo, roomInfoState } from '@/states/roomInfoState';
import { usePasswordForm } from '@/hooks/chat';
import { RoomListType, useRoomList } from '@/hooks/query/chat';
import { useJoinRoom } from '@/hooks/mutation/chat';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from '@floating-ui/react-dom-interactions';
import SideBarLayout from '@/molecule/SideBarLayout';
import SideBarHeader from '@/molecule/SideBarHeader';
import SectionList from '@/molecule/SectionList';
import ChatingRoom from '@/organism/ChatingRoom';
import CreateChatForm from '@/organism/CreateChatForm';
import Spinner from '@/atom/Spinner';
import Button from '@/atom/Button';

const Chat = () => {
  const [roomInfo, setRoomInfo] = useRecoilState(roomInfoState); //room_id need to be null when user is not in any room

  useEffect(() => {
    return () => {
      setRoomInfo(null);
    }
  }, [setRoomInfo])

  return (
    <SideBarLayout>
      {roomInfo ? (
        <ChatingRoom roomInfo={roomInfo} close={() => setRoomInfo(null)} />
      ) : (
        <ChattingRoomList />
      )}
    </SideBarLayout>
  );
};

function ChattingRoomList() {
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [roomListFilter, setRoomListFilter] = useState<RoomListType>('joined');

  const joinRoom = useJoinRoom();
  const setRoomInfo = useSetRecoilState(roomInfoState);
  const handleClick = (room: RoomInfo) => {
    if (roomListFilter == 'joined') {
      setRoomInfo(room);
    } else {
      if (room.room_access === 'public') {
        joinRoom.mutate({ room });
      } else if (room.room_access === 'protected') {
        setPassRoom(room);
        setPasswordFormOpen(true);
      }
    }
  };

  const {
    open: isPasswordFormOpen,
    setOpen: setPasswordFormOpen,
    context,
    floating,
    getFloatingProps,
  } = usePasswordForm();
  const [passRoom, setPassRoom] = useState<RoomInfo | null>(null);

  const { data: roomList, isLoading } = useRoomList(roomListFilter);
  const section = [
    {
      title: roomListFilter,
      list: roomList ?? [],
    },
  ];

  return (
    <>
      <SideBarHeader>
        <button
          className="flex flex-row items-center justify-start"
          onClick={() => setIsOpenForm(!isOpenForm)}
        >
          <p className="text-lg">Chat</p>
          <p className="px-1">{isOpenForm ? 'x' : '+'}</p>
        </button>
        <button
          className="text-xs"
          onClick={() =>
            setRoomListFilter(roomListFilter === 'all' ? 'joined' : 'all')
          }
        >
          All/Joined
        </button>
      </SideBarHeader>
      {isOpenForm ? <CreateChatForm /> : null}
      {isLoading ? (
        <Spinner />
      ) : (
        <SectionList
          sections={section}
          renderItem={(room) => (
            <button
              className="flex w-full flex-col items-start justify-center gap-1 p-2 px-5"
              onClick={() => handleClick(room)}
            >
              <p>{room.room_name}</p>
              <p className="text-xs">{room.room_access}</p>
            </button>
          )}
          keyExtractor={(room) => room.room_id}
        />
      )}
      <FloatingPortal>
        {isPasswordFormOpen ? (
          <FloatingOverlay
            lockScroll
            className="flex items-center justify-center bg-neutral-800/80"
          >
            <FloatingFocusManager context={context}>
              <div ref={floating} {...getFloatingProps()}>
                <PasswordForm
                  room={passRoom}
                  close={() => setPasswordFormOpen(false)}
                />
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        ) : null}
      </FloatingPortal>
    </>
  );
}

interface PasswordFormProps {
  room: RoomInfo | null;
  close(): void;
}

function PasswordForm({ room, close }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const joinRoom = useJoinRoom();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password) {
      toast.error('Enter the password', { toastId: 'empty-password-error' });
      return;
    }
    if (room) {
      joinRoom.mutate({ room, password }, { onSettled: close });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-60 flex-col gap-2 border border-neutral-400 bg-neutral-900
                 p-2 font-pixel text-sm text-white"
    >
      <input
        type="password"
        name="room_password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-neutral-700 p-1 focus:outline-none disabled:opacity-50"
        disabled={joinRoom.isLoading}
      />
      <div className="flex w-full flex-row gap-2">
        <Button
          type="submit"
          disabled={joinRoom.isLoading}
          className="w-2/3 bg-green-500"
        >
          Join
        </Button>
        <Button onClick={close} className="w-1/3 bg-red-500">
          Back
        </Button>
      </div>
    </form>
  );
}

export default Chat;
