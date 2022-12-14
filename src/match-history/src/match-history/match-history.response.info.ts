export class RmqMatchHistoryGameInfo {
  l_player_id: string;
  r_player_id: string;
  difficulty: string;
  mode: string;
  game_id: string;
  start_game: Date;
}

export class RmqMatchHistoryGameResult {
  game_id: string;
  l_player_score: number;
  r_player_score: number;
  winner_id: string;
  end_time: Date;
}

export class RmqMatchHistoryRankHistory {
  user_id: string;
  game_id: string;
  delta: number;
}

class User {
  user_id: string;
  nickname: string;
  prof_img: string;
  mmr: number;
  score: number;
}

export class RmqMatchHistoryGame {
  game_id: string;
  winner: string;
  game_end: Date;
  game_start: Date;
  difficulty: string;
  mode: string;
  l_player: User;
  r_player: User;
}
