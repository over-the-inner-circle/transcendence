import Spinner from '@/atom/Spinner';
import { useCancelBlockUser } from '@/hooks/mutation/user';
import { BlockData, useBlockedFriends } from '@/hooks/query/user';
import SectionList from '@/molecule/SectionList';
import SideBarHeader from '@/molecule/SideBarHeader';
import { FriendsListType } from '@/organism/Friends';

interface BlockedFriendListProps {
  setListType(listType: FriendsListType): void;
}

function BlockedFriendsList({ setListType }: BlockedFriendListProps) {
  const { data, isLoading } = useBlockedFriends();

  const sections = [
    {
      title: 'blocked',
      list: data ?? [],
    },
  ];

  return (
    <>
      <SideBarHeader>
        <div className="flex flex-row items-center justify-start gap-3">
          <button onClick={() => setListType('friends')}>&lt;</button>
          <p>Blocked Friends</p>
        </div>
      </SideBarHeader>
      {isLoading ? (
        <Spinner />
      ) : (
        <SectionList
          sections={sections}
          renderItem={(data) => <BlockedFriendItem data={data} />}
          keyExtractor={(data) => data.block_id}
        />
      )}
    </>
  );
}

interface BlockedFriendItemProps {
  data: BlockData;
}

function BlockedFriendItem({ data }: BlockedFriendItemProps) {
  const cancelBlock = useCancelBlockUser();

  return (
    <div className="flex flex-row justify-between px-5 py-3">
      <p>{data.blocked?.nickname ?? 'unknown'}</p>
      <button
        onClick={() => cancelBlock.mutate(data.block_id)}
        className="pl-3"
      >
        X
      </button>
    </div>
  );
}

export default BlockedFriendsList;
