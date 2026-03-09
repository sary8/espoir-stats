export interface SeasonInfo {
  id: string;
  label: string;
  default?: boolean;
}

export type MemberRole = "player" | "coach" | "head_coach" | "assistant_coach" | "manager";

const ROLE_LABELS: Record<MemberRole, string> = {
  player: "Player",
  coach: "Coach",
  head_coach: "Head Coach",
  assistant_coach: "Assistant Coach",
  manager: "Manager",
};

export function getRoleLabel(role: MemberRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function isStaffRole(role: MemberRole): boolean {
  return role !== "player";
}

export interface RosterPlayer {
  memberId: string;
  role: MemberRole;
  number: number | null;
  name: string;
  hasImage: boolean;
}

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

export interface PlayerListEntry extends RosterPlayer {
  summary: PlayerSummary | null;
}

export interface PlayerProfile {
  player: RosterPlayer;
  summary: PlayerSummary | null;
  games: { gameId: string; opponent: string; date: string; stat: GamePlayerStat }[];
}

export interface GamePlayerStat {
  gameId: string;
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

export interface QuarterScore {
  quarter: string;
  espoir: number;
  opponent: number;
}

export interface GameInfo {
  tournament: string | null;
  venue: string | null;
  gameType: string | null;
}

export interface TeamSeasonStats {
  seasonId: string;
  label: string;
  games: number;
  wins: number;
  losses: number;
  totalPoints: number;
  avgPoints: number;
  threePointPct: number | null;
  totalRebounds: number;
  rebounds: number;
  totalAssists: number;
  assists: number;
  totalSteals: number;
  steals: number;
  totalBlocks: number;
  blocks: number;
  totalTurnovers: number;
  turnovers: number;
  pace: number;
  offRtg: number;
  defRtg: number;
  netRtg: number;
}

export interface PlayerSeasonStats {
  seasonId: string;
  label: string;
  memberId: string;
  name: string;
  number: number | null;
  role: MemberRole;
  games: number;
  totalPoints: number;
  ppg: number;
  totalRebounds: number;
  rpg: number;
  totalAssists: number;
  apg: number;
  totalSteals: number;
  spg: number;
  totalBlocks: number;
  bpg: number;
  threePointPct: number | null;
  twoPointPct: number | null;
  ftPct: number | null;
  eff: number;
  avgEff: number;
}

export interface CrossSeasonMember {
  memberId: string;
  name: string;
  number: number | null;
  role: MemberRole;
  seasons: PlayerSeasonStats[];
}

export interface GameResult {
  gameId: string;
  opponent: string;
  date: string;
  players: GamePlayerStat[];
  teamPoints: number;
  opponentPlayers: GamePlayerStat[];
  opponentPoints: number;
  youtubeUrl: string | null;
  quarterScores: QuarterScore[];
  gameInfo: GameInfo;
}

// --- Award types ---

export type AwardCategory =
  | "category-leader"
  | "best-game"
  | "mvp"
  | "milestone";

export interface Award {
  category: AwardCategory;
  title: string;
  memberId: string;
  playerName: string;
  playerNumber: number | null;
  value: number;
  detail?: string;
}

export interface SeasonAwardSet {
  mvp: Award | null;
  categoryLeaders: Award[];
  bestGameRecords: Award[];
  milestones: Award[];
}

// --- All-Time Records types ---

export interface CareerTotals {
  memberId: string;
  name: string;
  number: number | null;
  seasonsPlayed: number;
  games: number;
  totalPoints: number;
  ppg: number;
  totalRebounds: number;
  rpg: number;
  totalAssists: number;
  apg: number;
  totalSteals: number;
  spg: number;
  totalBlocks: number;
  bpg: number;
  totalEff: number;
  avgEff: number;
}

export interface AllTimeSingleGameRecord {
  title: string;
  memberId: string;
  playerName: string;
  playerNumber: number | null;
  value: number;
  opponent: string;
  date: string;
  seasonLabel: string;
}
