import { useState } from 'react';
import { useInviteFriend } from '@/hooks/mutation/chat';
import { RoomInfo } from '@/states/roomInfoState';
import Button from '@/atom/Button';

function InviteFriendForm({ roomInfo }: { roomInfo: RoomInfo }) {
  const [query, setQuery] = useState<string>('');
  const inviteFriend = useInviteFriend(roomInfo.room_id);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (query) {
      inviteFriend.mutate(query);
      setQuery('');
    }
  };

  return (
    <form
      className="flex h-16 w-full flex-row items-center border-b border-neutral-400 bg-neutral-800"
      onSubmit={handleSubmit}
    >
      <div className="flex h-full w-full items-center justify-start bg-neutral-800 px-3">
        <input
          className="w-full bg-neutral-700 py-1"
          name="q"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="px-2">
        <Button className="w-min bg-green-500 px-1" type="submit">
          invite
        </Button>
      </div>
    </form>
  );
}

export default InviteFriendForm;
