import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { accessTokenState, currentUserInfoState } from '@/states/user/auth';
import { RoomUser } from '@/states/roomInfoState';
import { Friend } from '@/hooks/query/friends';
import { Message } from '@/hooks/query/chat';
import {
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react-dom-interactions';

interface SubscribeData {
  sender: Friend | null;
  message: Message;
}

export function useChat(roomId: string) {
  const queryClient = useQueryClient();
  const socketRef = useSocketRef(`ws://${import.meta.env.VITE_BASE_URL}:9999`);

  useEffect(() => {
    const socket = socketRef.current;

    const handleSub = (data: SubscribeData) => {
      queryClient.setQueryData<Message[]>(
        ['chat/room/messages', roomId],
        (prevMsg) => {
          const newMessage: Message = {
            ...data.message,
            sender: data.sender,
          };
          return prevMsg ? [...prevMsg, newMessage] : [newMessage];
        },
      );
    };

    const handleAnnounce = (data: { payload: string }) => {
      toast.info(data.payload);
    };

    socket.emit('join', { room: roomId });

    socket.on('subscribe', handleSub);
    socket.on('subscribe_self', handleSub);
    socket.on('announcement', handleAnnounce);

    return () => {
      socket.off('subscribe', handleSub);
      socket.off('subscribe_self', handleSub);
      socket.off('announcement', handleAnnounce);
    };
  }, [roomId, queryClient, socketRef]);

  return { socket: socketRef.current };
}

export function useMyRole(users: RoomUser[] | undefined) {
  const currentUserInfo = useRecoilValue(currentUserInfoState);
  const [myRole, setMyRole] = useState<RoomUser['role']>('user');

  useEffect(() => {
    const myUser = users?.find(
      (user) => user.user_id === currentUserInfo?.user_id,
    );
    if (myUser) {
      setMyRole(myUser.role);
    }
  }, [users, currentUserInfo?.user_id]);

  return myRole;
}

export function usePasswordForm() {
  const [open, setOpen] = useState(false);
  const { floating, context } = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  return { open, setOpen, floating, context, getFloatingProps };
}

export function useSocketRef(url: string) {
  const access_token = useRecoilValue(accessTokenState);
  const socketRef = useRef(
    io(url, {
      auth: { access_token },
      autoConnect: false,
    }),
  );

  useEffect(() => {
    const socket = socketRef.current;

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (access_token) {
      socket.auth = { access_token };
      socket.connect();
    }
  }, [access_token]);

  return socketRef;
}

export function useAutoScroll(dependency: unknown) {
  const autoScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollElement = autoScrollRef.current;
    if (scrollElement) {
      // FIX: 맨 아래를 보고 있을 때만 동작하게 하기
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [dependency]);

  return autoScrollRef;
}
