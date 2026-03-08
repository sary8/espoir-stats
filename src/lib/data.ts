import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { PlayerSummary, GamePlayerStat, GameResult, QuarterScore, GameInfo, SeasonInfo, RosterPlayer, PlayerListEntry, PlayerProfile } from "./types";
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

function hasMemberImage(season: string, memberId: string): boolean {
  const filePath = path.join(process.cwd(), "private", "players", season, `${memberId}.png`);
  return fs.existsSync(filePath);
}

const _rosterCache = new Map<string, RosterPlayer[]>();

function parseRosterNumber(value: string | undefined): number | null {
  const parsed = parseStatInt(value);
  return parsed > 0 ? parsed : null;
}

function parseRosterRole(value: string | undefined): "player" | "coach" {
  return value === "coach" ? "coach" : "player";
}

function compareRosterPlayers(a: RosterPlayer, b: RosterPlayer): number {
  if (a.role !== b.role) return a.role === "player" ? -1 : 1;
  if (a.number !== null && b.number !== null) return a.number - b.number;
  if (a.number !== null) return -1;
  if (b.number !== null) return 1;
  return a.name.localeCompare(b.name, "ja");
}

export function getRosterPlayers(season?: string): RosterPlayer[] {
  const s = season ?? getDefaultSeason();
  if (_rosterCache.has(s)) return _rosterCache.get(s)!;

  const csv = readCsv(s, "roster.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const roster = data
    .map((row) => {
      const number = parseRosterNumber(row["No."]);
      const memberId = (row["memberId"] ?? "").trim() || (number !== null ? String(number) : "");
      return {
        memberId,
        role: parseRosterRole(row["role"]),
        number,
        name: row["選手名"],
        hasImage: memberId ? hasMemberImage(s, memberId) : false,
      };
    })
    .filter((member) => member.memberId && member.name)
    .sort(compareRosterPlayers);

  _rosterCache.set(s, roster);
  return roster;
}

function isTeamCoaches(row: Record<string, string>): boolean {
  return row["選手名"] === "Team/Coaches";
}

function parseStatInt(value: string | undefined): number {
  const parsed = parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getGameIdFromInfoRow(row: Record<string, string>): string {
  const gameId = row["試合ID"];
  if (gameId) return gameId;

  const date = row["日付"];
  const opponent = row["対戦相手"];
  if (!date || !opponent) {
    throw new Error("試合情報.csv に必要な試合識別情報がありません");
  }

  return `${date}__${opponent}`;
}

function getGameIdFromStatsRow(row: Record<string, string>): string {
  const gameId = row["試合ID"];
  if (!gameId) {
    throw new Error("スタッツCSV に 試合ID 列がありません");
  }
  return gameId;
}

function parseGamePlayerStat(row: Record<string, string>): GamePlayerStat {
  return {
    gameId: getGameIdFromStatsRow(row),
    opponent: row["対戦相手"],
    number: parseStatInt(row["No."]) || -1,
    name: row["選手名"],
    starter: row["GS"] === "●",
    points: parseStatInt(row["PTS"]),
    threePointMade: parseStatInt(row["3PM"]),
    threePointAttempt: parseStatInt(row["3PA"]),
    threePointPct: parsePctString(row["3P%"]),
    twoPointMade: parseStatInt(row["2PM"]),
    twoPointAttempt: parseStatInt(row["2PA"]),
    twoPointPct: parsePctString(row["2P%"]),
    dunk: parseStatInt(row["DK"]),
    ftMade: parseStatInt(row["FTM"]),
    ftAttempt: parseStatInt(row["FTA"]),
    ftPct: parsePctString(row["FT%"]),
    offReb: parseStatInt(row["OR"]),
    defReb: parseStatInt(row["DR"]),
    totalReb: parseStatInt(row["TOT"]),
    assists: parseStatInt(row["AST"]),
    steals: parseStatInt(row["STL"]),
    blocks: parseStatInt(row["BLK"]),
    turnovers: parseStatInt(row["TO"]),
    personalFouls: parseStatInt(row["PF"]),
    technicalFouls: parseStatInt(row["TF"]),
    offensiveFouls: parseStatInt(row["OF"]),
    foulsDrawn: parseStatInt(row["FO"]),
    disqualifications: parseStatInt(row["DQ"]),
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
    const num = parseStatInt(row["No."]);
    const entry = foulMap.get(num) ?? { pf: 0, fo: 0 };
    entry.pf += parseStatInt(row["PF"]);
    entry.fo += parseStatInt(row["FO"]);
    foulMap.set(num, entry);
  }

  const result = data.map((row) => {
    const num = parseStatInt(row["No."]);
    const fouls = foulMap.get(num) ?? { pf: 0, fo: 0 };
    return {
      number: num,
      name: row["選手名"],
      games: parseStatInt(row["試合数"]),
      totalPoints: parseStatInt(row["合計得点"]),
      ppg: parseFloat(row["平均得点"]),
      threePointMade: parseStatInt(row["3PM"]),
      threePointAttempt: parseStatInt(row["3PA"]),
      threePointPct: parsePctString(row["3P%"]),
      twoPointMade: parseStatInt(row["2PM"]),
      twoPointAttempt: parseStatInt(row["2PA"]),
      twoPointPct: parsePctString(row["2P%"]),
      ftMade: parseStatInt(row["FTM"]),
      ftAttempt: parseStatInt(row["FTA"]),
      ftPct: parsePctString(row["FT%"]),
      offReb: parseStatInt(row["OR"]),
      defReb: parseStatInt(row["DR"]),
      totalReb: parseStatInt(row["TOT REB"]),
      assists: parseStatInt(row["AST"]),
      steals: parseStatInt(row["STL"]),
      blocks: parseStatInt(row["BLK"]),
      turnovers: parseStatInt(row["TO"]),
      personalFouls: fouls.pf,
      foulsDrawn: fouls.fo,
    };
  });
  _playerSummariesCache.set(s, result);
  return result;
}

export function getMemberList(season?: string): PlayerListEntry[] {
  const roster = getRosterPlayers(season);
  const summaries = getPlayerSummaries(season);
  const summaryMap = new Map(summaries.map((summary) => [summary.number, summary]));
  return roster.map((member) => ({
    ...member,
    summary: member.number !== null && member.role === "player" ? (summaryMap.get(member.number) ?? null) : null,
  }));
}

export function getPlayerList(season?: string): PlayerListEntry[] {
  return getMemberList(season);
}

interface GameInfoRow {
  gameId: string;
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
    const gameId = getGameIdFromInfoRow(row);
    const quarters: QuarterScore[] = [];
    for (const q of ["1Q", "2Q", "3Q", "4Q"]) {
      const espoir = parseInt(row[`${q}_自`] ?? "", 10);
      const opp = parseInt(row[`${q}_相手`] ?? "", 10);
      if (!isNaN(espoir) && !isNaN(opp)) {
        quarters.push({ quarter: q, espoir, opponent: opp });
      }
    }
    map.set(gameId, {
      gameId,
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
    const gameId = getGameIdFromStatsRow(row);
    if (!map.has(gameId)) map.set(gameId, []);
    map.get(gameId)!.push(parseGamePlayerStat(row));
  }
  return map;
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
    const gameId = getGameIdFromStatsRow(row);
    if (!gameMap.has(gameId)) gameMap.set(gameId, []);
    gameMap.get(gameId)!.push(parseGamePlayerStat(row));
  }

  const result = Array.from(gameMap.entries())
    .map(([gameId, players]) => {
      const info = gameInfo.get(gameId);
      const opponent = players[0]?.opponent ?? "";
      const oppPlayers = opponentStats.get(gameId) ?? [];
      const sortedPlayers = players.sort((a, b) => a.number - b.number);
      const sortedOpp = oppPlayers.sort((a, b) => a.number - b.number);
      return {
        gameId,
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

export function getGameById(gameId: string, season?: string): GameResult | null {
  const games = getGameStats(season);
  return games.find((g) => g.gameId === gameId) ?? null;
}

export function getAllGameIds(season?: string): string[] {
  return getGameStats(season).map((g) => g.gameId);
}

export function getMemberById(memberId: string, season?: string): PlayerProfile | null {
  const roster = getRosterPlayers(season);
  const member = roster.find((entry) => entry.memberId === memberId);
  if (!member) return null;

  const summaries = getPlayerSummaries(season);
  const games = getGameStats(season);
  const summary = member.number !== null && member.role === "player"
    ? (summaries.find((p) => p.number === member.number) ?? null)
    : null;

  const memberGames = member.number !== null && member.role === "player"
    ? games
    .map((g) => {
      const stat = g.players.find((p) => p.number === member.number);
      return stat ? { gameId: g.gameId, opponent: g.opponent, date: g.date, stat } : null;
    })
    .filter((g): g is { gameId: string; opponent: string; date: string; stat: GamePlayerStat } => g !== null)
    : [];

  return { player: member, summary, games: memberGames };
}

export function getPlayerByNumber(number: number, season?: string): PlayerProfile | null {
  const member = getRosterPlayers(season).find((entry) => entry.role === "player" && entry.number === number);
  return member ? getMemberById(member.memberId, season) : null;
}

export function getAllMemberIds(season?: string): string[] {
  return getRosterPlayers(season).map((member) => member.memberId);
}

export function getAllPlayerNumbers(season?: string): number[] {
  return getRosterPlayers(season)
    .filter((member) => member.role === "player" && member.number !== null)
    .map((member) => member.number as number);
}

export function getAdjacentMembers(memberId: string, season?: string): { prev: { memberId: string; number: number | null; name: string } | null; next: { memberId: string; number: number | null; name: string } | null } {
  const members = getRosterPlayers(season);
  const idx = members.findIndex((member) => member.memberId === memberId);
  return {
    prev: idx > 0 ? { memberId: members[idx - 1].memberId, number: members[idx - 1].number, name: members[idx - 1].name } : null,
    next: idx < members.length - 1 ? { memberId: members[idx + 1].memberId, number: members[idx + 1].number, name: members[idx + 1].name } : null,
  };
}

export function getAdjacentPlayers(number: number, season?: string): { prev: { number: number; name: string } | null; next: { number: number; name: string } | null } {
  const players = getRosterPlayers(season).filter((member) => member.role === "player" && member.number !== null);
  const idx = players.findIndex((p) => p.number === number);
  const prevPlayer = idx > 0 ? players[idx - 1] : null;
  const nextPlayer = idx < players.length - 1 ? players[idx + 1] : null;
  return {
    prev: prevPlayer && prevPlayer.number !== null ? { number: prevPlayer.number, name: prevPlayer.name } : null,
    next: nextPlayer && nextPlayer.number !== null ? { number: nextPlayer.number, name: nextPlayer.name } : null,
  };
}

export function getAdjacentGames(gameId: string, season?: string): { prev: { gameId: string; opponent: string; date: string } | null; next: { gameId: string; opponent: string; date: string } | null } {
  const games = getGameStats(season);
  const idx = games.findIndex((g) => g.gameId === gameId);
  return {
    prev: idx > 0 ? { gameId: games[idx - 1].gameId, opponent: games[idx - 1].opponent, date: games[idx - 1].date } : null,
    next: idx < games.length - 1 ? { gameId: games[idx + 1].gameId, opponent: games[idx + 1].opponent, date: games[idx + 1].date } : null,
  };
}
