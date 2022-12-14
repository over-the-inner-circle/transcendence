import Spinner from '@/atom/Spinner';
import { RequestedFriend, useRequestedFriends } from '@/hooks/query/friends';
import {
  useFriendRequestAccept,
  useFriendRequestReject,
} from '@/hooks/mutation/friends';
import { FriendsListType } from '@/organism/Friends';
import SectionList from '@/molecule/SectionList';
import SideBarHeader from '@/molecule/SideBarHeader';

interface RequestedFriendListProps {
  setListType(listType: FriendsListType): void;
}

function RequestedFriendsList({ setListType }: RequestedFriendListProps) {
  const sentFriends = useRequestedFriends('sent');
  const recvFriends = useRequestedFriends('recv');

  const requestedData = [
    {
      title: 'recv',
      list: recvFriends.data,
    },
    {
      title: 'sent',
      list: sentFriends.data,
    },
  ];

  if (sentFriends.isLoading || recvFriends.isLoading) {
    return <Spinner />;
  }
  if (sentFriends.isError || recvFriends.isError) {
    return null;
  }

  return (
    <>
      <SideBarHeader>
        <div className="flex flex-row items-center justify-start gap-3">
          <button onClick={() => setListType('friends')}>&lt;</button>
          <p>Requested Friends</p>
        </div>
      </SideBarHeader>
      <SectionList
        sections={requestedData}
        renderItem={(data, type) => (
          <RequestedFriendItem data={data} type={type} />
        )}
        keyExtractor={(data) => data.request_id}
      />
    </>
  );
}

interface RequestedFriendItemProps {
  data: RequestedFriend;
  type?: string;
}

function RequestedFriendItem({ data, type }: RequestedFriendItemProps) {
  const accept = useFriendRequestAccept();
  const reject = useFriendRequestReject();

  return (
    <div className="flex flex-row justify-between px-5 py-3">
      <p>{data.user_info.nickname}</p>
      <div>
        {type === 'recv' ? (
          <button onClick={() => accept.mutate(data.request_id)}>V</button>
        ) : null}
        <button
          onClick={() => reject.mutate({ request_id: data.request_id, type })}
          className="pl-3"
        >
          X
        </button>
      </div>
    </div>
  );
}

export default RequestedFriendsList;
