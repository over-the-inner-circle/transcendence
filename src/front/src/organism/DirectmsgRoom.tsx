import { useSetRecoilState } from 'recoil';
import { useAutoScroll } from '@/hooks/chat';
import { useOptionMenu } from '@/hooks/optionMenu';
import { useRequestNormalGame } from '@/hooks/game';
import { useDirectMessageSocket, useUpdateDmHistory } from '@/hooks/dm';
import { useDirectMessages } from '@/hooks/query/dm';
import { useUserInfo } from '@/hooks/query/user';
import { profileUserState } from '@/states/user/profileUser';
import { FloatingPortal } from '@floating-ui/react-dom-interactions';
import OptionMenu, { Option } from '@/molecule/OptionMenu';
import Textarea from '@/molecule/Textarea';
import { useBlockUser } from '@/hooks/mutation/user';

interface DirectmsgRoomProps {
  opponent: string;
  close(): void;
}

function DirectmsgRoom({ opponent, close }: DirectmsgRoomProps) {
  const { socket } = useDirectMessageSocket(opponent);
  const { data: opponentInfo } = useUserInfo(opponent);
  const {
    open,
    setOpen,
    reference,
    floating,
    getReferenceProps,
    getFloatingProps,
    x,
    y,
    strategy,
  } = useOptionMenu();
  useUpdateDmHistory(opponentInfo);

  const handleSubmit = (content: string) => {
    content = content.trim();
    if (content) {
      socket.emit('publish', { opponent, payload: content });
    }
  };

  return (
    <>
      <div className="flex h-fit w-full items-center justify-between border-b border-inherit bg-neutral-800 p-3">
        <button onClick={close} className="px-1">
          &lt;
        </button>
        <div className="flex flex-col items-start justify-center">
          <p>{opponent}</p>
        </div>
        <button ref={reference} {...getReferenceProps()} className="px-1">
          :
        </button>
        <FloatingPortal>
          {open && (
            <div
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: 'max-content',
              }}
              {...getFloatingProps()}
            >
              <OpponentOpionMenu
                opponent={opponent}
                close={() => setOpen(false)}
              />
            </div>
          )}
        </FloatingPortal>
      </div>
      <MessageContainer opponent={opponent} />
      <Textarea onSubmit={handleSubmit} />
    </>
  );
}

interface OpponentOpionMenuProps {
  opponent: string;
  close?(): void;
}

function OpponentOpionMenu({ opponent, close }: OpponentOpionMenuProps) {
  const requestNormalGame = useRequestNormalGame();
  const setProfileUser = useSetRecoilState(profileUserState);
  const blockUser = useBlockUser();

  const options: Option[] = [
    {
      label: 'View Profile',
      onClick: () => {
        setProfileUser(opponent);
      },
    },
    {
      label: 'Invite Game',
      onClick: () => {
        requestNormalGame(opponent);
      },
    },
    {
      label: 'Block',
      color: 'text-red-700',
      onClick: () => {
        blockUser.mutate(opponent);
      },
    },
  ];
  return <OptionMenu options={options} close={close} />;
}

interface MessageContainerProps {
  opponent: string;
}

function MessageContainer({ opponent }: MessageContainerProps) {
  const { data: messages } = useDirectMessages(opponent);
  const autoScrollRef = useAutoScroll(messages);

  return (
    <div
      ref={autoScrollRef}
      className="h-full w-full grow overflow-y-auto border-b border-inherit"
    >
      <ul className="flex h-fit w-full flex-col items-start justify-start">
        {messages?.map((message, idx) => (
          <li
            key={idx}
            className="h-fit w-full break-words p-1 px-5 text-xs"
          >{`${message.sender?.nickname ?? 'unknown'}: ${message.payload}`}</li>
        ))}
      </ul>
    </div>
  );
}

export default DirectmsgRoom;
