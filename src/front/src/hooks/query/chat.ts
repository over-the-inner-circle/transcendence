import { useFetcher } from '@/hooks/fetcher';
import { Friend } from '@/hooks/query/friends';
import { RoomInfo, RoomUser } from '@/states/roomInfoState';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Message {
  room_msg_id: number;
  room_id: string;
  sender: Friend | null;
  payload: string;
  created: string;
}

export type RoomListType = 'all' | 'joined';

export function useChatMessages(roomId: string) {
  const fetcher = useFetcher();
  const data = useQuery<Message[]>({
    queryKey: ['chat/room/messages', roomId],
    queryFn: async () => {
      const res = await fetcher(`/chat/room/${roomId}/messages`);

      if (res.ok) {
        const data = await res.json();
        return data.messages;
      }
      return [];
    },
    refetchOnWindowFocus: false,
  });

  return data;
}

export function useRoomList(type: RoomListType) {
  const queryClient = useQueryClient();
  const fetcher = useFetcher();
  const result = useQuery({
    queryKey: ['chat/rooms', type],
    queryFn: async (): Promise<RoomInfo[]> => {
      const res = await fetcher(`/chat/rooms/${type}`);
      if (res.ok) {
        const data = await res.json();
        return data.rooms;
      }
      return [];
    },
    select: (roomList) => {
      if (type === 'all') {
        const joinedRoomList = queryClient.getQueryData<RoomInfo[]>([
          'chat/rooms',
          'joined',
        ]);

        if (joinedRoomList) {
          return roomList.filter(
            (all) =>
              !joinedRoomList.find((joined) => joined.room_id === all.room_id),
          );
        }
      }
      return roomList;
    },
  });
  return result;
}

export function useMemberList(roomInfo: RoomInfo) {
  const fetcher = useFetcher();
  const result = useQuery({
    queryKey: ['chat/room', 'member', roomInfo.room_id],
    queryFn: async (): Promise<RoomUser[]> => {
      const res = await fetcher(`/chat/room/${roomInfo.room_id}/members`);

      if (res.ok) {
        const data = await res.json();
        return data.members;
      }
      return [];
    },
  });
  return result;
}
