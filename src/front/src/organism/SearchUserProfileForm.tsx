import { profileUserState } from '@/states/user/profileUser';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';

function SearchUserProfileForm() {
  const [query, setQuery] = useState('');
  const setProfileUser = useSetRecoilState(profileUserState);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query) {
      setProfileUser(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-40 border-b font-pixel text-sm text-white"
    >
      <button type="submit">@</button>
      <input
        type="search"
        placeholder="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-inherit p-2"
      />
    </form>
  );
}

export default SearchUserProfileForm;
