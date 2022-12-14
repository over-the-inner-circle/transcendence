import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { FloatingPortal } from '@floating-ui/react-dom-interactions';
import { profileUserState } from '@/states/user/profileUser';
import { Friend, useFriends } from '@/hooks/query/friends';
import { useDeleteFriend } from '@/hooks/mutation/friends';
import { useOptionMenu } from '@/hooks/optionMenu';
import { useBlockUser } from '@/hooks/mutation/user';
import { useRequestNormalGame, useRequestWatchGame } from '@/hooks/game';
import { useSetCurrentDMOpponent } from '@/hooks/dm';
import { useFriendsStatusSocket } from '@/hooks/friends';
import Spinner from '@/atom/Spinner';
import SectionList from '@/molecule/SectionList';
import OptionMenu, { Option } from '@/molecule/OptionMenu';
import { FriendsListType } from '@/organism/Friends';
import StatusIndicator from '@/molecule/StatusIndicator';
import SideBarHeader from '@/molecule/SideBarHeader';
import AddFriendForm from '@/organism/AddFriendForm';

interface FriendsListProps {
  setListType(listType: FriendsListType): void;
}

function FriendsList({ setListType }: FriendsListProps) {
  const { friends, isLoading, isError } = useFriends();
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
  const [isOpenForm, setIsOpenForm] = useState<boolean>(false);
  useFriendsStatusSocket();

  if (isLoading) return <Spinner />;
  if (isError) return null;

  return (
    <>
      <SideBarHeader>
        <button
          className="flex flex-row items-center justify-start"
          onClick={() => setIsOpenForm(!isOpenForm)}
        >
          <p className="text-lg">Friends</p>
          <p className="px-1">{isOpenForm ? 'x' : '+'}</p>
        </button>
        <button ref={reference} {...getReferenceProps()}>
          :
        </button>
      </SideBarHeader>
      {isOpenForm ? <AddFriendForm /> : null}
      <SectionList
        sections={friends}
        renderItem={(friend) => <FriendItem friend={friend} />}
        keyExtractor={(friend) => friend.user_id}
      />
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
            <OtherOptionMenu
              setListType={setListType}
              close={() => setOpen(false)}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}

interface OtherOptionMenuProps {
  setListType(type: FriendsListType): void;
  close?(): void;
}

function OtherOptionMenu({ setListType, close }: OtherOptionMenuProps) {
  const options: Option[] = [
    {
      label: 'Requested',
      onClick: () => {
        setListType('requestedFriends');
      },
    },
    {
      label: 'Blocked',
      onClick: () => {
        setListType('blockedFriends');
      },
    },
  ];

  return <OptionMenu options={options} close={close} />;
}

interface FriendItemProps {
  friend: Friend;
  onClickItem?(friend: Friend): void;
  onClickOption?(friend: Friend): void;
}

function FriendItem({ friend }: FriendItemProps) {
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
  const setProfileUser = useSetRecoilState(profileUserState);

  return (
    <div className="flex h-full w-full flex-row items-center justify-start p-3 px-5">
      <button
        className="min-w-fit"
        onClick={() => setProfileUser(friend.nickname)}
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
          <img
            src={friend.prof_img}
            alt="profile"
            width={65}
            height={65}
            className="h-full w-full object-cover"
          />
        </div>
      </button>
      <div className="flex h-16 min-w-0 flex-col justify-around px-5">
        <p className="truncate text-base">{friend.nickname}</p>
        <div className="flex flex-row items-center space-x-2">
          <StatusIndicator status={friend.state} radius={8} />
          <p className="min-w-0 truncate text-xs">{friend.state}</p>
        </div>
      </div>
      <button
        ref={reference}
        {...getReferenceProps()}
        className="ml-auto mt-2 flex h-full w-4 items-start text-lg hover:text-neutral-400"
      >
        :
      </button>
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
            <FriendOptionMenu friend={friend} close={() => setOpen(false)} />
          </div>
        )}
      </FloatingPortal>
    </div>
  );
}

interface FriendOptionMenuProps {
  friend: Friend;
  close(): void;
}

function FriendOptionMenu({ friend, close }: FriendOptionMenuProps) {
  const deleteFriend = useDeleteFriend();
  const blockUser = useBlockUser();
  const requestWatchGame = useRequestWatchGame();
  const requestNormalGame = useRequestNormalGame();
  const setCurrentDMOpponent = useSetCurrentDMOpponent();

  const options: Option[] = [
    {
      label: 'Invite Game',
      onClick: () => {
        requestNormalGame(friend.nickname);
      },
    },
    {
      label: 'Watch Game',
      onClick: () => {
        requestWatchGame(friend.nickname);
      },
    },
    {
      label: 'DM',
      onClick: () => {
        setCurrentDMOpponent(friend.nickname);
      },
    },
    {
      label: 'Block',
      onClick: () => {
        blockUser.mutate(friend.nickname);
      },
    },
    {
      label: 'Delete',
      color: 'text-red-700',
      onClick: () => {
        if (confirm('Are you sure?')) {
          deleteFriend.mutate(friend);
        }
      },
    },
  ];

  return <OptionMenu options={options} close={close} />;
}

export default FriendsList;
