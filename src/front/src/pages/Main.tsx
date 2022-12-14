import { useRecoilValue } from 'recoil';
import { useNotification } from '@/hooks/notification';
import { currentSideBarItemState } from '@/states/currentSideBarItemState';

import Nav from '@/organism/Nav';
import Chat from '@/organism/Chat';
import Friends from '@/organism/Friends';
import Directmsg from '@/organism/Directmsg';
import UserProfileModal from '@/organism/UserProfileModal';
import GameContainer from '@/templates/GameContainer';
import EditAccountInfoModal from '@/organism/EditAccountInfoModal';
import { useRefreshToken } from '@/hooks/query/user';

function SidebarSelector() {
  const currentSideBarItem = useRecoilValue(currentSideBarItemState);

  return currentSideBarItem === 'dm' ? (
    <Directmsg />
  ) : currentSideBarItem === 'friend' ? (
    <Friends />
  ) : (
    <Chat />
  );
}

function Main() {
  useRefreshToken();
  useNotification();

  return (
    <div className="mx-auto my-0 flex h-full w-full flex-col bg-neutral-600">
      <Nav />
      <div className="flex h-full min-h-0 w-full">
        <GameContainer />
        <SidebarSelector />
      </div>
      <UserProfileModal />
      <EditAccountInfoModal />
    </div>
  );
}

export default Main;
