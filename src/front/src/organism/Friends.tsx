import { useState } from 'react';
import SideBarLayout from '@/molecule/SideBarLayout';
import FriendsList from '@/organism/FriendsList';
import RequestedFriendsList from '@/organism/RequestedFriendsList';
import BlockedFriendsList from '@/organism/BlockedFriendsList';

export type FriendsListType = 'friends' | 'requestedFriends' | 'blockedFriends';

function Friends() {
  const [listType, setListType] = useState<FriendsListType>('friends');

  return (
    <SideBarLayout>
      {listType === 'friends' ? (
        <FriendsList setListType={setListType} />
      ) : listType === 'requestedFriends' ? (
        <RequestedFriendsList setListType={setListType} />
      ) : (
        <BlockedFriendsList setListType={setListType} />
      )}
    </SideBarLayout>
  );
}

export default Friends;
