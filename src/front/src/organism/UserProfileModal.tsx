import { useProfileModal } from '@/hooks/profileModal';
import { useUserInfo } from '@/hooks/query/user';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from '@floating-ui/react-dom-interactions';
import Spinner from '@/atom/Spinner';
import UserMatchHistory from './UserMatchHistory';

function UserProfileModal() {
  const { profileUser, open, setOpen, context, floating, getFloatingProps } =
    useProfileModal();

  return (
    <FloatingPortal>
      {open && profileUser && (
        <FloatingOverlay
          lockScroll
          className="flex items-center justify-center bg-neutral-800/80"
        >
          <FloatingFocusManager context={context}>
            <div
              className="h-3/4 w-2/3 overflow-auto"
              ref={floating}
              {...getFloatingProps()}
            >
              <UserProfile
                nickname={profileUser}
                close={() => setOpen(false)}
              />
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
}

interface UserProfileProps {
  nickname: string;
  close(): void;
}

function UserProfile({ nickname, close }: UserProfileProps) {
  const { data, isError, isLoading } = useUserInfo(nickname);

  return (
    <div
      className="flex h-fit w-full flex-col items-center justify-start
                 border-4 bg-neutral-900 p-4 font-pixel text-white"
    >
      <div className="flex w-full items-start">
        <button onClick={close}>X</button>
      </div>
      <div className="flex w-full max-w-lg flex-col space-y-6 pt-8">
        {isError ? (
          <h2>Could not found {`'${nickname}'`}</h2>
        ) : isLoading ? (
          <div className="py-28">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex flex-row items-center">
              <div className="m-1 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full">
                <img
                  src={data.prof_img}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col space-y-2 pl-5">
                <p className="text-2xl">{data.nickname}</p>
                <p>mmr: {data.mmr}</p>
              </div>
            </div>
            <UserMatchHistory nickname={data.nickname} />
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfileModal;
