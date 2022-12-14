import { useOptionMenu } from '@/hooks/optionMenu';
import { useRequestNormalGame } from '@/hooks/game';
import { profileUserState } from '@/states/user/profileUser';
import { useSetRecoilState } from 'recoil';
import {
  useChageRole,
  useKickMember,
  useRestrictMember,
} from '@/hooks/mutation/chat';
import { useMyRole } from '@/hooks/chat';
import { useMemberList } from '@/hooks/query/chat';
import { FloatingPortal } from '@floating-ui/react-dom-interactions';
import { Option } from '@/molecule/OptionMenu';
import { RoomInfo, RoomUser } from '@/states/roomInfoState';
import Spinner from '@/atom/Spinner';

interface ShowUserListProps {
  roomInfo: RoomInfo;
  close(): void;
}

function ShowUserList({ roomInfo, close }: ShowUserListProps) {
  const { data: users, isError, isLoading } = useMemberList(roomInfo);
  const role = useMyRole(users);

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
      {isLoading || isError ? (
        <Spinner />
      ) : (
        <div className="h-full w-full grow overflow-y-auto border-b border-inherit">
          <ul className="flex h-fit w-full flex-col items-start justify-start">
            {users.map((user) => (
              <li
                key={user.user_id}
                className="h-fit w-full break-words border-b border-neutral-400 p-1 px-5 text-xs"
              >
                <ShowUserItem
                  roomInfo={roomInfo}
                  user={user}
                  role={role}
                  close={close}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

interface ShowUserItemProps {
  roomInfo: RoomInfo;
  user: RoomUser;
  role: RoomUser['role'];
  close(): void;
}

function ShowUserItem({ roomInfo, user, role }: ShowUserItemProps) {
  const {
    open,
    setOpen,
    reference,
    floating,
    getReferenceProps,
    getFloatingProps,
    x,
    y,
    strategy,
  } = useOptionMenu();

  return (
    <>
      <button ref={reference} {...getReferenceProps()}>
        <div className="text-lg">{user.nickname}</div>
      </button>
      <div className="ml-auto mt-2 flex h-full w-10 items-start justify-center text-xs hover:text-neutral-400">
        {user.role}
      </div>
      <FloatingPortal>
        {open && (
          <div
            ref={floating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
            }}
            {...getFloatingProps()}
          >
            <UserOptionMenu
              roomInfo={roomInfo}
              user={user}
              myRole={role}
              close={() => setOpen(false)}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}

interface UserOptionMenuProps {
  roomInfo: RoomInfo;
  user: RoomUser;
  myRole: RoomUser['role'];
  close(): void;
}

function UserOptionMenu({
  roomInfo,
  user,
  myRole,
  close,
}: UserOptionMenuProps) {
  const requestNormalGame = useRequestNormalGame();
  const setProfileUser = useSetRecoilState(profileUserState);
  const restrictMember = useRestrictMember(roomInfo.room_id);
  const changeRole = useChageRole(roomInfo.room_id);
  const kickMember = useKickMember(roomInfo.room_id);

  const options: Option[] = [
    {
      label: 'Invite Game',
      onClick: () => {
        requestNormalGame(user.nickname);
      },
    },
    {
      label: 'View Profile',
      onClick: () => {
        setProfileUser(user.nickname);
      },
    },
  ];

  if (myRole === 'owner' && user.role === 'user') {
    options.push({
      label: 'Set admin',
      onClick: () => {
        changeRole.mutate({ user, role: 'admin' });
      },
    });
  }

  if (
    (myRole === 'owner' && user.role !== 'owner') ||
    (myRole === 'admin' && user.role === 'user')
  ) {
    const adminOptions: Option[] = [
      {
        label: 'Ban',
        onClick: () => {
          restrictMember.mutate({ user, type: 'ban' });
        },
      },
      {
        label: 'Mute',
        onClick: () => {
          restrictMember.mutate({ user, type: 'mute' });
        },
      },
      {
        label: 'Kick',
        onClick: () => {
          kickMember.mutate(user);
        },
      },
    ];

    options.push(...adminOptions);
  }

  return <UserListOptionView options={options} close={close} />;
}

interface UserListOptionProps {
  options: Option[];
  close(): void;
}

function UserListOptionView({ options }: UserListOptionProps) {
  return (
    <ul>
      {options.map((option) => (
        <li
          key={option.label}
          className="bg-neutral-800 p-3 font-pixel text-xs text-white"
        >
          <button
            onClick={() => {
              option.onClick();
              close();
            }}
            className={`''} h-full w-full`}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ShowUserList;
