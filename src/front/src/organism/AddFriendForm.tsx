import { useState } from 'react';
import { useAddFriend } from '@/hooks/mutation/friends';

function AddFriendForm() {
  const [query, setQuery] = useState<string>('');
  const addFriend = useAddFriend();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (query) {
      addFriend.mutate(query);
      setQuery('');
    }
  };

  return (
    <form
      className="flex h-16 w-full shrink-0 flex-row items-center border-b border-neutral-400 bg-neutral-800"
      onSubmit={handleSubmit}
    >
      <button className="px-2" type="submit">
        +
      </button>
      <div className="flex h-full w-min items-center bg-neutral-800">
        <input
          className=" w-min border-b-4 border-white bg-inherit"
          name="q"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </form>
  );
}

export default AddFriendForm;
