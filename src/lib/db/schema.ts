import { pgTable, text, integer, boolean, decimal, date, serial, unique } from "drizzle-orm/pg-core";

// --- seasons ---
export const seasons = pgTable("seasons", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

// --- roster ---
export const roster = pgTable("roster", {
  id: serial("id").primaryKey(),
  seasonId: text("season_id").notNull().references(() => seasons.id),
  memberId: text("member_id").notNull(),
  role: text("role").notNull().default("player"),
  number: integer("number"),
  name: text("name").notNull(),
  hasImage: boolean("has_image").notNull().default(false),
}, (t) => [
  unique("roster_season_member").on(t.seasonId, t.memberId),
]);

// --- player_summaries ---
export const playerSummaries = pgTable("player_summaries", {
  id: serial("id").primaryKey(),
  seasonId: text("season_id").notNull().references(() => seasons.id),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  games: integer("games").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  ppg: decimal("ppg", { precision: 5, scale: 1 }).notNull().default("0"),
  threePointMade: integer("three_point_made").notNull().default(0),
  threePointAttempt: integer("three_point_attempt").notNull().default(0),
  threePointPct: decimal("three_point_pct", { precision: 5, scale: 1 }),
  twoPointMade: integer("two_point_made").notNull().default(0),
  twoPointAttempt: integer("two_point_attempt").notNull().default(0),
  twoPointPct: decimal("two_point_pct", { precision: 5, scale: 1 }),
  ftMade: integer("ft_made").notNull().default(0),
  ftAttempt: integer("ft_attempt").notNull().default(0),
  ftPct: decimal("ft_pct", { precision: 5, scale: 1 }),
  offReb: integer("off_reb").notNull().default(0),
  defReb: integer("def_reb").notNull().default(0),
  totalReb: integer("total_reb").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  steals: integer("steals").notNull().default(0),
  blocks: integer("blocks").notNull().default(0),
  turnovers: integer("turnovers").notNull().default(0),
  personalFouls: integer("personal_fouls").notNull().default(0),
  foulsDrawn: integer("fouls_drawn").notNull().default(0),
}, (t) => [
  unique("player_summaries_season_number").on(t.seasonId, t.number),
]);

// --- games ---
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  seasonId: text("season_id").notNull().references(() => seasons.id),
  gameId: text("game_id").notNull(),
  opponent: text("opponent").notNull(),
  date: date("date").notNull(),
  teamPoints: integer("team_points").notNull().default(0),
  opponentPoints: integer("opponent_points").notNull().default(0),
  youtubeUrl: text("youtube_url"),
  tournament: text("tournament"),
  venue: text("venue"),
  gameType: text("game_type"),
}, (t) => [
  unique("games_season_game_id").on(t.seasonId, t.gameId),
]);

// --- quarter_scores ---
export const quarterScores = pgTable("quarter_scores", {
  id: serial("id").primaryKey(),
  gamePk: integer("game_pk").notNull().references(() => games.id),
  quarter: text("quarter").notNull(),
  espoir: integer("espoir").notNull(),
  opponent: integer("opponent").notNull(),
});

// --- game_player_stats ---
export const gamePlayerStats = pgTable("game_player_stats", {
  id: serial("id").primaryKey(),
  gamePk: integer("game_pk").notNull().references(() => games.id),
  isOpponent: boolean("is_opponent").notNull().default(false),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  starter: boolean("starter").notNull().default(false),
  points: integer("points").notNull().default(0),
  threePointMade: integer("three_point_made").notNull().default(0),
  threePointAttempt: integer("three_point_attempt").notNull().default(0),
  threePointPct: decimal("three_point_pct", { precision: 5, scale: 1 }),
  twoPointMade: integer("two_point_made").notNull().default(0),
  twoPointAttempt: integer("two_point_attempt").notNull().default(0),
  twoPointPct: decimal("two_point_pct", { precision: 5, scale: 1 }),
  dunk: integer("dunk").notNull().default(0),
  ftMade: integer("ft_made").notNull().default(0),
  ftAttempt: integer("ft_attempt").notNull().default(0),
  ftPct: decimal("ft_pct", { precision: 5, scale: 1 }),
  offReb: integer("off_reb").notNull().default(0),
  defReb: integer("def_reb").notNull().default(0),
  totalReb: integer("total_reb").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  steals: integer("steals").notNull().default(0),
  blocks: integer("blocks").notNull().default(0),
  turnovers: integer("turnovers").notNull().default(0),
  personalFouls: integer("personal_fouls").notNull().default(0),
  technicalFouls: integer("technical_fouls").notNull().default(0),
  offensiveFouls: integer("offensive_fouls").notNull().default(0),
  foulsDrawn: integer("fouls_drawn").notNull().default(0),
  disqualifications: integer("disqualifications").notNull().default(0),
  minutes: text("minutes"),
});
