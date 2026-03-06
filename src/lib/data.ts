import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { PlayerSummary, GamePlayerStat, GameResult } from "./types";
import { parsePctString } from "./utils";

function readCsv(filename: string): string {
  const filePath = path.join(process.cwd(), "stats-csv", filename);
  return fs.readFileSync(filePath, "utf-8");
}

export function getPlayerSummaries(): PlayerSummary[] {
  const csv = readCsv("選手別サマリ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  // サマリCSVにPF/FOがないため全試合スタッツから集計
  const gameCsv = readCsv("全試合スタッツ.csv");
  const { data: gameData } = Papa.parse<Record<string, string>>(gameCsv, { header: true, skipEmptyLines: true });
  const foulMap = new Map<number, { pf: number; fo: number }>();
  for (const row of gameData) {
    const num = parseInt(row["No."], 10);
    const entry = foulMap.get(num) ?? { pf: 0, fo: 0 };
    entry.pf += parseInt(row["PF"], 10) || 0;
    entry.fo += parseInt(row["FO"], 10) || 0;
    foulMap.set(num, entry);
  }

  return data.map((row) => {
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
}

export function getGameStats(): GameResult[] {
  const csv = readCsv("全試合スタッツ.csv");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  const gameMap = new Map<string, { date: string; youtubeUrl: string | null; players: GamePlayerStat[] }>();

  for (const row of data) {
    const opponent = row["対戦相手"];
    const date = row["日付"] ?? "9999-12-31";
    const youtubeUrl = row["YouTube"] || null;
    const stat: GamePlayerStat = {
      opponent,
      number: parseInt(row["No."], 10),
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

    if (!gameMap.has(opponent)) gameMap.set(opponent, { date, youtubeUrl, players: [] });
    else if (youtubeUrl) gameMap.get(opponent)!.youtubeUrl = youtubeUrl;
    gameMap.get(opponent)!.players.push(stat);
  }

  return Array.from(gameMap.entries())
    .map(([opponent, { date, youtubeUrl, players }]) => ({
      opponent,
      date,
      players: players.sort((a, b) => a.number - b.number),
      teamPoints: players.reduce((sum, p) => sum + p.points, 0),
      youtubeUrl,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
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
