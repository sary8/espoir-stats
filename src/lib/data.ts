import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { PlayerSummary, GamePlayerStat, GameResult, QuarterScore, GameInfo } from "./types";
import { parsePctString } from "./utils";

function readCsv(filename: string): string {
  const filePath = path.join(process.cwd(), "stats-csv", filename);
  return fs.readFileSync(filePath, "utf-8");
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

let _cachedPlayerSummaries: PlayerSummary[] | null = null;

export function getPlayerSummaries(): PlayerSummary[] {
  if (_cachedPlayerSummaries) return _cachedPlayerSummaries;
  const csv = readCsv("選手別サマリ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  // サマリCSVにPF/FOがないため全試合スタッツから集計
  const gameCsv = readCsv("全試合スタッツ.csv");
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
  _cachedPlayerSummaries = result;
  return result;
}

interface GameInfoRow {
  date: string;
  youtubeUrl: string | null;
  quarterScores: QuarterScore[];
  gameInfo: GameInfo;
}

function getGameInfoMap(): Map<string, GameInfoRow> {
  const csv = readCsv("試合情報.csv");
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

function getOpponentStatsMap(): Map<string, GamePlayerStat[]> {
  const csv = readCsv("相手チームスタッツ.csv");
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

let _cachedGameStats: GameResult[] | null = null;

export function getGameStats(): GameResult[] {
  if (_cachedGameStats) return _cachedGameStats;
  const csv = readCsv("全試合スタッツ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const gameInfo = getGameInfoMap();
  const opponentStats = getOpponentStatsMap();

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
  _cachedGameStats = result;
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

export function getGameByOpponent(opponent: string): GameResult | null {
  const games = getGameStats();
  return games.find((g) => g.opponent === opponent) ?? null;
}

export function getAllOpponents(): string[] {
  return getGameStats().map((g) => g.opponent);
}

export function getPlayerByNumber(number: number) {
  const summaries = getPlayerSummaries();
  const games = getGameStats();
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

export function getAllPlayerNumbers(): number[] {
  return getPlayerSummaries().map((p) => p.number);
}
