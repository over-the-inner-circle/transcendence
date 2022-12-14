import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useFetcher } from '@/hooks/fetcher';
import { Friend } from '@/hooks/query/friends';

export function useAddFriend() {
  const queryClient = useQueryClient();
  const fetcher = useFetcher();
  const mutation = useMutation({
    mutationFn: async (nickname: string) => {
      const res = await fetcher(`/friend/request/${nickname}`, {
        method: 'POST',
      });
      if (res.ok) return res;
      throw res;
    },
    onSuccess: (_, nickname) => {
      queryClient.invalidateQueries({ queryKey: ['friend/request', 'sent'] });
      toast.success(`sent friend request to ${nickname}`);
    },
    onError: (error, nickname) => {
      let errorMsg = `friend request to ${nickname} failed`;

      if (error instanceof Response) {
        if (error.status === 404) {
          errorMsg = `could not found ${nickname}`;
        }
      }
      toast.error(errorMsg);
    },
  });
  return mutation;
}

export function useDeleteFriend() {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (friend: Friend) => {
      return fetcher(`/friend/${friend.nickname}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend/all'] });
    },
  });

  return deleteMutation;
}

export function useFriendRequestAccept() {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();
  const acceptMutation = useMutation({
    mutationFn: (request_id: string) => {
      return fetcher(`/friend/request/${request_id}/accept`, {
        method: 'POST',
      });
    },
    onSuccess: (res) => {
      if (!res.ok) throw res;
      queryClient.invalidateQueries({ queryKey: ['friend/request'] });
      queryClient.invalidateQueries({ queryKey: ['friend/all'] });
      toast.success('success');
    },
    onError: () => {
      toast.error('friend acceptance failed');
    },
  });

  return acceptMutation;
}

export function useFriendRequestReject() {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();
  const rejectMutation = useMutation({
    mutationFn: ({
      request_id,
      type,
    }: {
      request_id: string;
      type?: string;
    }) => {
      if (type === 'sent') {
        return fetcher(`/friend/request/${request_id}`, {
          method: 'DELETE',
        });
      }
      return fetcher(`/friend/request/${request_id}/reject`, {
        method: 'POST',
      });
    },
    onError: () => toast.error('reject is failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend/request'] });
    },
  });

  return rejectMutation;
}
