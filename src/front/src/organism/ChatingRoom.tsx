import { useState } from 'react';
import { RoomInfo } from '@/states/roomInfoState';
import { useAutoScroll, useChat } from '@/hooks/chat';
import { useChatMessages } from '@/hooks/query/chat';
import Textarea from '@/molecule/Textarea';
import ShowUserList from '@/organism/ShowUserList';
import ChattingRoomMenu from '@/organism/ChattingRoomMenu';

export type ChattingSideBarState = 'chat' | 'menu' | 'userList';

export interface ChattingSideBarProps {
  roomInfo: RoomInfo;
  close(): void;
  setSidebarState(sidebarState: ChattingSideBarState): void;
}

function ChattingRoom({
  roomInfo,
  close,
  setSidebarState,
}: ChattingSideBarProps) {
  const { socket } = useChat(roomInfo.room_id);
  const { data: messages } = useChatMessages(roomInfo.room_id);
  const autoScrollRef = useAutoScroll(messages);

  const sendMessage = (content: string) => {
    const msg = content.trim();
    if (msg) {
      socket.emit('publish', { room: roomInfo.room_id, payload: msg });
    }
  };

  return (
    <>
      <div className="flex h-fit w-full items-center justify-between border-b border-inherit bg-neutral-800 p-3">
        <button onClick={close} className="px-1">
          &lt;
        </button>
        {roomInfo.room_name}
        <button onClick={() => setSidebarState('menu')} className="px-1">
          :
        </button>
      </div>
      <div
        ref={autoScrollRef}
        className="h-full w-full grow overflow-y-auto border-b border-inherit"
      >
        <ul className="flex h-fit w-full flex-col items-start justify-start">
          {messages?.map((message) => (
            <li
              key={message.room_msg_id}
              className="h-fit w-full break-words p-1 px-5 text-xs"
            >{`${message.sender?.nickname ?? 'unknown'}: ${
              message.payload
            }`}</li>
          ))}
        </ul>
      </div>
      <Textarea onSubmit={sendMessage} />
    </>
  );
}

export interface ChattingRoomProps {
  roomInfo: RoomInfo;
  close(): void;
}

function ChattingRoomWrapper({ roomInfo, close }: ChattingRoomProps) {
  const [sidebarState, setSidebarState] =
    useState<ChattingSideBarState>('chat');

  switch (sidebarState) {
    case 'menu':
      return (
        <ChattingRoomMenu
          roomInfo={roomInfo}
          close={() => setSidebarState('chat')}
          setSidebarState={setSidebarState}
        />
      );
    case 'userList':
      return (
        <ShowUserList
          roomInfo={roomInfo}
          close={() => setSidebarState('menu')}
        />
      );
    default:
      return (
        <ChattingRoom
          roomInfo={roomInfo}
          close={close}
          setSidebarState={setSidebarState}
        />
      );
  }
}

export default ChattingRoomWrapper;
