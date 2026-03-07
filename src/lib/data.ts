import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { PlayerSummary, GamePlayerStat, GameResult, QuarterScore, GameInfo, SeasonInfo } from "./types";
import { parsePctString } from "./utils";

// --- Season management ---

let _cachedSeasons: SeasonInfo[] | null = null;

export function getSeasons(): SeasonInfo[] {
  if (_cachedSeasons) return _cachedSeasons;
  const filePath = path.join(process.cwd(), "stats-csv", "seasons.json");
  const json = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(json) as { seasons: SeasonInfo[] };
  _cachedSeasons = parsed.seasons;
  return parsed.seasons;
}

export function getDefaultSeason(): string {
  const seasons = getSeasons();
  const def = seasons.find((s) => s.default);
  return def ? def.id : seasons[0].id;
}

// --- CSV reading ---

function readCsv(season: string, filename: string): string {
  const filePath = path.join(process.cwd(), "stats-csv", season, filename);
  return fs.readFileSync(filePath, "utf-8");
}

function seasonHasData(season: string): boolean {
  const filePath = path.join(process.cwd(), "stats-csv", season, "選手別サマリ.csv");
  return fs.existsSync(filePath);
}

export function getSeasonsWithData(): SeasonInfo[] {
  return getSeasons().filter((s) => seasonHasData(s.id));
}

function isTeamCoaches(row: Record<string, string>): boolean {
  return row["選手名"] === "Team/Coaches";
}

function parseGamePlayerStat(row: Record<string, string>): GamePlayerStat {
  return {
    opponent: row["対戦相手"],
    number: parseInt(row["No."], 10) || -1,
    name: row["選手名"],
    starter: row["GS"] === "●",
    points: parseInt(row["PTS"], 10),
    threePointMade: parseInt(row["3PM"], 10),
    threePointAttempt: parseInt(row["3PA"], 10),
    threePointPct: parseInt(row["3P%"], 10),
    twoPointMade: parseInt(row["2PM"], 10),
    twoPointAttempt: parseInt(row["2PA"], 10),
    twoPointPct: parseInt(row["2P%"], 10),
    dunk: parseInt(row["DK"], 10),
    ftMade: parseInt(row["FTM"], 10),
    ftAttempt: parseInt(row["FTA"], 10),
    ftPct: parseInt(row["FT%"], 10),
    offReb: parseInt(row["OR"], 10),
    defReb: parseInt(row["DR"], 10),
    totalReb: parseInt(row["TOT"], 10),
    assists: parseInt(row["AST"], 10),
    steals: parseInt(row["STL"], 10),
    blocks: parseInt(row["BLK"], 10),
    turnovers: parseInt(row["TO"], 10),
    personalFouls: parseInt(row["PF"], 10),
    technicalFouls: parseInt(row["TF"], 10),
    offensiveFouls: parseInt(row["OF"], 10),
    foulsDrawn: parseInt(row["FO"], 10) || 0,
    disqualifications: parseInt(row["DQ"], 10),
    minutes: row["MIN"],
  };
}

// --- Cached data with season key ---

const _playerSummariesCache = new Map<string, PlayerSummary[]>();

export function getPlayerSummaries(season?: string): PlayerSummary[] {
  const s = season ?? getDefaultSeason();
  if (_playerSummariesCache.has(s)) return _playerSummariesCache.get(s)!;

  const csv = readCsv(s, "選手別サマリ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  const gameCsv = readCsv(s, "全試合スタッツ.csv");
  const { data: gameData } = Papa.parse<Record<string, string>>(gameCsv, { header: true, skipEmptyLines: true });
  const foulMap = new Map<number, { pf: number; fo: number }>();
  for (const row of gameData) {
    if (isTeamCoaches(row)) continue;
    const num = parseInt(row["No."], 10);
    const entry = foulMap.get(num) ?? { pf: 0, fo: 0 };
    entry.pf += parseInt(row["PF"], 10) || 0;
    entry.fo += parseInt(row["FO"], 10) || 0;
    foulMap.set(num, entry);
  }

  const result = data.map((row) => {
    const num = parseInt(row["No."], 10);
    const fouls = foulMap.get(num) ?? { pf: 0, fo: 0 };
    return {
      number: num,
      name: row["選手名"],
      games: parseInt(row["試合数"], 10),
      totalPoints: parseInt(row["合計得点"], 10),
      ppg: parseFloat(row["平均得点"]),
      threePointMade: parseInt(row["3PM"], 10),
      threePointAttempt: parseInt(row["3PA"], 10),
      threePointPct: parsePctString(row["3P%"]),
      twoPointMade: parseInt(row["2PM"], 10),
      twoPointAttempt: parseInt(row["2PA"], 10),
      twoPointPct: parsePctString(row["2P%"]),
      ftMade: parseInt(row["FTM"], 10),
      ftAttempt: parseInt(row["FTA"], 10),
      ftPct: parsePctString(row["FT%"]),
      offReb: parseInt(row["OR"], 10),
      defReb: parseInt(row["DR"], 10),
      totalReb: parseInt(row["TOT REB"], 10),
      assists: parseInt(row["AST"], 10),
      steals: parseInt(row["STL"], 10),
      blocks: parseInt(row["BLK"], 10),
      turnovers: parseInt(row["TO"], 10),
      personalFouls: fouls.pf,
      foulsDrawn: fouls.fo,
    };
  });
  _playerSummariesCache.set(s, result);
  return result;
}

interface GameInfoRow {
  date: string;
  youtubeUrl: string | null;
  quarterScores: QuarterScore[];
  gameInfo: GameInfo;
}

function getGameInfoMap(season: string): Map<string, GameInfoRow> {
  const csv = readCsv(season, "試合情報.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const map = new Map<string, GameInfoRow>();
  for (const row of data) {
    const quarters: QuarterScore[] = [];
    for (const q of ["1Q", "2Q", "3Q", "4Q"]) {
      const espoir = parseInt(row[`${q}_自`], 10);
      const opp = parseInt(row[`${q}_相手`], 10);
      if (!isNaN(espoir) && !isNaN(opp)) {
        quarters.push({ quarter: q, espoir, opponent: opp });
      }
    }
    map.set(row["対戦相手"], {
      date: row["日付"] ?? "9999-12-31",
      youtubeUrl: row["YouTube"] || null,
      quarterScores: quarters,
      gameInfo: {
        tournament: row["大会名"] || null,
        venue: row["会場"] || null,
        gameType: row["試合種別"] || null,
      },
    });
  }
  return map;
}

function getOpponentStatsMap(season: string): Map<string, GamePlayerStat[]> {
  const csv = readCsv(season, "相手チームスタッツ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const map = new Map<string, GamePlayerStat[]>();
  for (const row of data) {
    const opponent = row["対戦相手"];
    if (!map.has(opponent)) map.set(opponent, []);
    map.get(opponent)!.push(parseGamePlayerStat(row));
  }
  return map;
}

function parseMinutesToSeconds(min: string): number {
  if (!min) return 0;
  const parts = min.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}

function secondsToMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const GAME_TOTAL_SECONDS = 160 * 60; // 1試合 = 160分(8クォーター × 5人)

function adjustMinutesTo160(players: GamePlayerStat[]): void {
  if (players.length === 0) return;
  const realPlayers = players.filter(p => p.name !== "Team/Coaches");
  if (realPlayers.length === 0) return;
  const totalSeconds = realPlayers.reduce((sum, p) => sum + parseMinutesToSeconds(p.minutes), 0);
  const diff = GAME_TOTAL_SECONDS - totalSeconds;
  if (diff <= 0) return;

  let minIdx = players.indexOf(realPlayers[0]);
  let minSec = parseMinutesToSeconds(realPlayers[0].minutes);
  for (let i = 1; i < realPlayers.length; i++) {
    const sec = parseMinutesToSeconds(realPlayers[i].minutes);
    if (sec < minSec) {
      minSec = sec;
      minIdx = players.indexOf(realPlayers[i]);
    }
  }
  players[minIdx].minutes = secondsToMinutes(minSec + diff);
}

const _gameStatsCache = new Map<string, GameResult[]>();

export function getGameStats(season?: string): GameResult[] {
  const s = season ?? getDefaultSeason();
  if (_gameStatsCache.has(s)) return _gameStatsCache.get(s)!;

  const csv = readCsv(s, "全試合スタッツ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const gameInfo = getGameInfoMap(s);
  const opponentStats = getOpponentStatsMap(s);

  const gameMap = new Map<string, GamePlayerStat[]>();

  for (const row of data) {
    const opponent = row["対戦相手"];
    if (!gameMap.has(opponent)) gameMap.set(opponent, []);
    gameMap.get(opponent)!.push(parseGamePlayerStat(row));
  }

  const result = Array.from(gameMap.entries())
    .map(([opponent, players]) => {
      const info = gameInfo.get(opponent);
      const oppPlayers = opponentStats.get(opponent) ?? [];
      const sortedPlayers = players.sort((a, b) => a.number - b.number);
      const sortedOpp = oppPlayers.sort((a, b) => a.number - b.number);
      adjustMinutesTo160(sortedPlayers);
      adjustMinutesTo160(sortedOpp);
      return {
        opponent,
        date: info?.date ?? "9999-12-31",
        players: sortedPlayers,
        teamPoints: players.reduce((sum, p) => sum + p.points, 0),
        opponentPlayers: sortedOpp,
        opponentPoints: oppPlayers.reduce((sum, p) => sum + p.points, 0),
        youtubeUrl: info?.youtubeUrl ?? null,
        quarterScores: info?.quarterScores ?? [],
        gameInfo: info?.gameInfo ?? { tournament: null, venue: null, gameType: null },
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  _gameStatsCache.set(s, result);
  return result;
}

export function getTopPlayers(players: PlayerSummary[]) {
  return {
    topScorer: [...players].sort((a, b) => b.ppg - a.ppg)[0].number,
    topRebounder: [...players].sort((a, b) => b.totalReb - a.totalReb)[0].number,
    topAssister: [...players].sort((a, b) => b.assists - a.assists)[0].number,
    top3P: [...players].sort((a, b) => b.threePointMade - a.threePointMade)[0].number,
    topStealer: [...players].sort((a, b) => b.steals - a.steals)[0].number,
    topBlocker: [...players].sort((a, b) => b.blocks - a.blocks)[0].number,
    topFoul: [...players].sort((a, b) => b.personalFouls - a.personalFouls)[0].number,
    topTurnover: [...players].sort((a, b) => b.turnovers - a.turnovers)[0].number,
  };
}

export function getGameByOpponent(opponent: string, season?: string): GameResult | null {
  const games = getGameStats(season);
  return games.find((g) => g.opponent === opponent) ?? null;
}

export function getAllOpponents(season?: string): string[] {
  return getGameStats(season).map((g) => g.opponent);
}

export function getPlayerByNumber(number: number, season?: string) {
  const summaries = getPlayerSummaries(season);
  const games = getGameStats(season);
  const summary = summaries.find((p) => p.number === number);
  if (!summary) return null;

  const playerGames = games
    .map((g) => {
      const stat = g.players.find((p) => p.number === number);
      return stat ? { opponent: g.opponent, date: g.date, stat } : null;
    })
    .filter((g): g is { opponent: string; date: string; stat: GamePlayerStat } => g !== null);

  return { summary, games: playerGames };
}

export function getAllPlayerNumbers(season?: string): number[] {
  return getPlayerSummaries(season).map((p) => p.number);
}

export function getAdjacentPlayers(number: number, season?: string): { prev: { number: number; name: string } | null; next: { number: number; name: string } | null } {
  const players = getPlayerSummaries(season).sort((a, b) => a.number - b.number);
  const idx = players.findIndex((p) => p.number === number);
  return {
    prev: idx > 0 ? { number: players[idx - 1].number, name: players[idx - 1].name } : null,
    next: idx < players.length - 1 ? { number: players[idx + 1].number, name: players[idx + 1].name } : null,
  };
}

export function getAdjacentGames(opponent: string, season?: string): { prev: { opponent: string; date: string } | null; next: { opponent: string; date: string } | null } {
  const games = getGameStats(season);
  const idx = games.findIndex((g) => g.opponent === opponent);
  return {
    prev: idx > 0 ? { opponent: games[idx - 1].opponent, date: games[idx - 1].date } : null,
    next: idx < games.length - 1 ? { opponent: games[idx + 1].opponent, date: games[idx + 1].date } : null,
  };
}
