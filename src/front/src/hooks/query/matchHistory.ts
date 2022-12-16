import { useQuery } from '@tanstack/react-query';
import { useFetcher } from '@/hooks/fetcher';

export interface HistoryUser {
  user_id: string;
  nickname: string;
  prof_img: string;
  score: number;
}

export interface MatchHistory {
  game_id: string;
  winner: string;
  game_start: string;
  game_end: string;
  difficulty: 'easy' | 'normal' | 'hard';
  mode: 'rank' | 'friendly';
  l_player: HistoryUser | null;
  r_player: HistoryUser | null;
}

export function useMatchHistory(nickname: string) {
  const fetcher = useFetcher();
  const data = useQuery<MatchHistory[]>({
    queryKey: ['matchHistory', nickname],
    queryFn: async () => {
      const res = await fetcher(`/history/${nickname}`);
      if (res.ok) return res.json();
      return [];
    },
  });
  return data;
}
