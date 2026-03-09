/**
 * CSVデータをNeon PostgreSQLに移行するスクリプト
 * 実行: npx tsx scripts/migrate-csv-to-db.ts
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const CSV_DIR = path.join(process.cwd(), "stats-csv");

function readCsv(season: string, filename: string): Record<string, string>[] {
  const filePath = path.join(CSV_DIR, season, filename);
  if (!fs.existsSync(filePath)) return [];
  const csv = fs.readFileSync(filePath, "utf-8");
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  return data;
}

function parseInt0(value: string | undefined): number {
  const parsed = parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parsePct(value: string | undefined): string | null {
  if (!value || value === "-") return null;
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? null : String(num);
}

function hasMemberImage(season: string, memberId: string): boolean {
  const filePath = path.join(process.cwd(), "private", "players", season, `${memberId}.png`);
  return fs.existsSync(filePath);
}

async function main() {
  const seasonsJson = JSON.parse(fs.readFileSync(path.join(CSV_DIR, "seasons.json"), "utf-8")) as {
    seasons: { id: string; label: string; default?: boolean }[];
  };

  console.log("=== Migrating seasons ===");
  for (const s of seasonsJson.seasons) {
    await db.insert(schema.seasons).values({
      id: s.id,
      label: s.label,
      isDefault: s.default ?? false,
    });
    console.log(`  Season: ${s.id}`);
  }

  for (const season of seasonsJson.seasons) {
    const sid = season.id;
    console.log(`\n=== Migrating ${sid} ===`);

    // --- roster ---
    const rosterRows = readCsv(sid, "roster.csv");
    console.log(`  Roster: ${rosterRows.length} members`);
    for (const row of rosterRows) {
      const num = parseInt(row["No."] ?? "", 10);
      const number = isNaN(num) || num <= 0 ? null : num;
      const memberId = (row["memberId"] ?? "").trim() || (number !== null ? String(number) : "");
      if (!memberId || !row["選手名"]) continue;
      await db.insert(schema.roster).values({
        seasonId: sid,
        memberId,
        role: row["role"] || "player",
        number,
        name: row["選手名"],
        hasImage: hasMemberImage(sid, memberId),
      });
    }

    // --- player_summaries ---
    const summaryRows = readCsv(sid, "選手別サマリ.csv");
    // PF/FDをgame statsから集計
    const gameStatsRows = readCsv(sid, "全試合スタッツ.csv");
    const foulMap = new Map<number, { pf: number; fo: number }>();
    for (const row of gameStatsRows) {
      if (row["選手名"] === "Team/Coaches") continue;
      const num = parseInt0(row["No."]);
      const entry = foulMap.get(num) ?? { pf: 0, fo: 0 };
      entry.pf += parseInt0(row["PF"]);
      entry.fo += parseInt0(row["FO"]);
      foulMap.set(num, entry);
    }

    console.log(`  Player summaries: ${summaryRows.length} players`);
    for (const row of summaryRows) {
      const num = parseInt0(row["No."]);
      const fouls = foulMap.get(num) ?? { pf: 0, fo: 0 };
      await db.insert(schema.playerSummaries).values({
        seasonId: sid,
        number: num,
        name: row["選手名"],
        games: parseInt0(row["試合数"]),
        totalPoints: parseInt0(row["合計得点"]),
        ppg: row["平均得点"] || "0",
        threePointMade: parseInt0(row["3PM"]),
        threePointAttempt: parseInt0(row["3PA"]),
        threePointPct: parsePct(row["3P%"]),
        twoPointMade: parseInt0(row["2PM"]),
        twoPointAttempt: parseInt0(row["2PA"]),
        twoPointPct: parsePct(row["2P%"]),
        ftMade: parseInt0(row["FTM"]),
        ftAttempt: parseInt0(row["FTA"]),
        ftPct: parsePct(row["FT%"]),
        offReb: parseInt0(row["OR"]),
        defReb: parseInt0(row["DR"]),
        totalReb: parseInt0(row["TOT REB"]),
        assists: parseInt0(row["AST"]),
        steals: parseInt0(row["STL"]),
        blocks: parseInt0(row["BLK"]),
        turnovers: parseInt0(row["TO"]),
        personalFouls: fouls.pf,
        foulsDrawn: fouls.fo,
      });
    }

    // --- games + quarter_scores ---
    const gameInfoRows = readCsv(sid, "試合情報.csv");
    console.log(`  Games: ${gameInfoRows.length} games`);

    // まずgame infoを挿入してPKを取得
    const gamePkMap = new Map<string, number>();
    for (const row of gameInfoRows) {
      const gameId = row["試合ID"] || `${row["日付"]}__${row["対戦相手"]}`;

      // team_points / opponent_points はstatsから計算
      const gamePlayers = gameStatsRows.filter(
        (r) => (r["試合ID"] || "") === gameId && r["選手名"] !== "Team/Coaches"
      );
      const teamPoints = gamePlayers.reduce((sum, r) => sum + parseInt0(r["PTS"]), 0);

      const oppRows = readCsv(sid, "相手チームスタッツ.csv").filter(
        (r) => (r["試合ID"] || "") === gameId
      );
      const opponentPoints = oppRows.reduce((sum, r) => sum + parseInt0(r["PTS"]), 0);

      const [inserted] = await db.insert(schema.games).values({
        seasonId: sid,
        gameId,
        opponent: row["対戦相手"],
        date: row["日付"],
        teamPoints,
        opponentPoints,
        youtubeUrl: row["YouTube"] || null,
        tournament: row["大会名"] || null,
        venue: row["会場"] || null,
        gameType: row["試合種別"] || null,
      }).returning({ id: schema.games.id });

      gamePkMap.set(gameId, inserted.id);

      // quarter scores
      for (const q of ["1Q", "2Q", "3Q", "4Q"]) {
        const espoir = parseInt(row[`${q}_自`] ?? "", 10);
        const opp = parseInt(row[`${q}_相手`] ?? "", 10);
        if (!isNaN(espoir) && !isNaN(opp)) {
          await db.insert(schema.quarterScores).values({
            gamePk: inserted.id,
            quarter: q,
            espoir,
            opponent: opp,
          });
        }
      }
    }

    // --- game_player_stats (Espoir) ---
    let espoirStatsCount = 0;
    for (const row of gameStatsRows) {
      if (row["選手名"] === "Team/Coaches") continue;
      const gameId = row["試合ID"];
      const gamePk = gamePkMap.get(gameId);
      if (!gamePk) continue;
      await db.insert(schema.gamePlayerStats).values({
        gamePk,
        isOpponent: false,
        number: parseInt0(row["No."]) || -1,
        name: row["選手名"],
        starter: row["GS"] === "●",
        points: parseInt0(row["PTS"]),
        threePointMade: parseInt0(row["3PM"]),
        threePointAttempt: parseInt0(row["3PA"]),
        threePointPct: parsePct(row["3P%"]),
        twoPointMade: parseInt0(row["2PM"]),
        twoPointAttempt: parseInt0(row["2PA"]),
        twoPointPct: parsePct(row["2P%"]),
        dunk: parseInt0(row["DK"]),
        ftMade: parseInt0(row["FTM"]),
        ftAttempt: parseInt0(row["FTA"]),
        ftPct: parsePct(row["FT%"]),
        offReb: parseInt0(row["OR"]),
        defReb: parseInt0(row["DR"]),
        totalReb: parseInt0(row["TOT"]),
        assists: parseInt0(row["AST"]),
        steals: parseInt0(row["STL"]),
        blocks: parseInt0(row["BLK"]),
        turnovers: parseInt0(row["TO"]),
        personalFouls: parseInt0(row["PF"]),
        technicalFouls: parseInt0(row["TF"]),
        offensiveFouls: parseInt0(row["OF"]),
        foulsDrawn: parseInt0(row["FO"]),
        disqualifications: parseInt0(row["DQ"]),
        minutes: row["MIN"] || null,
      });
      espoirStatsCount++;
    }
    console.log(`  Espoir player stats: ${espoirStatsCount} rows`);

    // --- game_player_stats (Opponent) ---
    const oppStatsRows = readCsv(sid, "相手チームスタッツ.csv");
    let oppStatsCount = 0;
    for (const row of oppStatsRows) {
      const gameId = row["試合ID"];
      const gamePk = gamePkMap.get(gameId);
      if (!gamePk) continue;
      await db.insert(schema.gamePlayerStats).values({
        gamePk,
        isOpponent: true,
        number: parseInt0(row["No."]) || -1,
        name: row["選手名"],
        starter: row["GS"] === "●",
        points: parseInt0(row["PTS"]),
        threePointMade: parseInt0(row["3PM"]),
        threePointAttempt: parseInt0(row["3PA"]),
        threePointPct: parsePct(row["3P%"]),
        twoPointMade: parseInt0(row["2PM"]),
        twoPointAttempt: parseInt0(row["2PA"]),
        twoPointPct: parsePct(row["2P%"]),
        dunk: parseInt0(row["DK"]),
        ftMade: parseInt0(row["FTM"]),
        ftAttempt: parseInt0(row["FTA"]),
        ftPct: parsePct(row["FT%"]),
        offReb: parseInt0(row["OR"]),
        defReb: parseInt0(row["DR"]),
        totalReb: parseInt0(row["TOT"]),
        assists: parseInt0(row["AST"]),
        steals: parseInt0(row["STL"]),
        blocks: parseInt0(row["BLK"]),
        turnovers: parseInt0(row["TO"]),
        personalFouls: parseInt0(row["PF"]),
        technicalFouls: parseInt0(row["TF"]),
        offensiveFouls: parseInt0(row["OF"]),
        foulsDrawn: parseInt0(row["FO"]),
        disqualifications: parseInt0(row["DQ"]),
        minutes: row["MIN"] || null,
      });
      oppStatsCount++;
    }
    console.log(`  Opponent player stats: ${oppStatsCount} rows`);
  }

  console.log("\n=== Migration complete! ===");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
