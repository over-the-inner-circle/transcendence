import { useRecoilState } from 'recoil';
import { currentSideBarItemState } from '@/states/currentSideBarItemState';
import DmIcon from '@/atom/DmIcon';
import ChatIcon from '@/atom/ChatIcon';
import FriendIcon from '@/atom/FriendIcon';
import CurrentUserWidget from '@/molecule/CurrentUserWidget';
import SearchUserProfileForm from './SearchUserProfileForm';

const Nav = () => {
  const [currentSideBarItem, setCurrentSideBarItem] = useRecoilState(
    currentSideBarItemState,
  );

  return (
    <div
      className="flex h-[78px] w-full items-center justify-between
                 border-b border-neutral-400 bg-neutral-800"
      id="nav"
    >
      <CurrentUserWidget />
      <div className="flex items-center gap-2 pr-2">
        <SearchUserProfileForm />
        <div className="">
          <button onClick={() => setCurrentSideBarItem('chat')}>
            <ChatIcon isActive={currentSideBarItem === 'chat'} />
          </button>
        </div>
        <div className="">
          <button onClick={() => setCurrentSideBarItem('friend')}>
            <FriendIcon isActive={currentSideBarItem === 'friend'} />
          </button>
        </div>
        <div className="">
          <button onClick={() => setCurrentSideBarItem('dm')}>
            <DmIcon isActive={currentSideBarItem === 'dm'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nav;
