import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useSetCurrentDMOpponent } from '@/hooks/dm';
import { useSearchUser } from '@/hooks/query/dm';
import { sortedDmHistoryState } from '@/states/dmHistoryState';
import SideBarHeader from '@/molecule/SideBarHeader';
import SectionList from '@/molecule/SectionList';

function DirectmsgList() {
  const setCurrentDMOpponent = useSetCurrentDMOpponent();
  const dmHistory = useRecoilValue(sortedDmHistoryState);

  return (
    <>
      <SideBarHeader>Direct Message</SideBarHeader>
      <AddDirectmsgForm />
      {dmHistory.length ? (
        <SectionList
          sections={[{ title: 'Recent history', list: dmHistory }]}
          renderItem={(dmInfo) => (
            <button
              className="flex w-full flex-col items-start justify-center gap-1 p-3 px-5"
              onClick={() => setCurrentDMOpponent(dmInfo.opponent.nickname)}
            >
              <p>{dmInfo.opponent.nickname}</p>
            </button>
          )}
          keyExtractor={(dmInfo) => dmInfo.opponent.user_id}
        />
      ) : null}
    </>
  );
}

function AddDirectmsgForm() {
  const [nickname, setNickname] = useState('');
  const [query, setQuery] = useState('');
  const { isFetching } = useSearchUser(query);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nickname) {
      setQuery(nickname);
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-row items-center gap-2
                   border-b border-neutral-400 bg-neutral-800 p-3 pl-5"
      >
        <label htmlFor="nickname">To.</label>
        <input
          className="w-full bg-neutral-700 p-1 disabled:opacity-20"
          name="nickname"
          type="search"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={isFetching}
          required
        />
        <button
          className="px-1 disabled:opacity-20"
          type="submit"
          disabled={isFetching}
        >
          Q
        </button>
      </form>
    </>
  );
}

export default DirectmsgList;
