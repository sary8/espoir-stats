export interface PlayerSummary {
  number: number;
  name: string;
  games: number;
  totalPoints: number;
  ppg: number;
  threePointMade: number;
  threePointAttempt: number;
  threePointPct: number | null;
  twoPointMade: number;
  twoPointAttempt: number;
  twoPointPct: number | null;
  ftMade: number;
  ftAttempt: number;
  ftPct: number | null;
  offReb: number;
  defReb: number;
  totalReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personalFouls: number;
  foulsDrawn: number;
}

export interface GamePlayerStat {
  opponent: string;
  number: number;
  name: string;
  starter: boolean;
  points: number;
  threePointMade: number;
  threePointAttempt: number;
  threePointPct: number | null;
  twoPointMade: number;
  twoPointAttempt: number;
  twoPointPct: number | null;
  dunk: number;
  ftMade: number;
  ftAttempt: number;
  ftPct: number | null;
  offReb: number;
  defReb: number;
  totalReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personalFouls: number;
  technicalFouls: number;
  offensiveFouls: number;
  foulsDrawn: number;
  disqualifications: number;
  minutes: string;
}

export interface GameResult {
  opponent: string;
  date: string;
  players: GamePlayerStat[];
  teamPoints: number;
}
