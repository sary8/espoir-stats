import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "./db";
import * as schema from "./db/schema";
import type {
  PlayerSummary,
  GamePlayerStat,
  GameResult,
  QuarterScore,
  GameInfo,
  SeasonInfo,
  RosterPlayer,
  PlayerListEntry,
  PlayerProfile,
  TeamSeasonStats,
  PlayerSeasonStats,
  CrossSeasonMember,
  MemberRole,
} from "./types";
import { calcEff, calcAdvancedStats, parseMinutesToSeconds } from "./stats";

// --- helpers ---

function toNumber(val: string | null | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function toNullableNumber(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function toRole(val: string): MemberRole {
  if (val === "head_coach") return "head_coach";
  if (val === "assistant_coach") return "assistant_coach";
  if (val === "manager") return "manager";
  if (val === "coach") return "coach";
  return "player";
}

function compareRosterPlayers(a: RosterPlayer, b: RosterPlayer): number {
  if (a.role !== b.role) return a.role === "player" ? -1 : 1;
  if (a.number !== null && b.number !== null) return a.number - b.number;
  if (a.number !== null) return -1;
  if (b.number !== null) return 1;
  return a.name.localeCompare(b.name, "ja");
}

function mapGamePlayerStat(
  row: typeof schema.gamePlayerStats.$inferSelect,
  gameId: string,
  opponent: string,
): GamePlayerStat {
  return {
    gameId,
    opponent,
    number: row.number,
    name: row.name,
    starter: row.starter,
    points: row.points,
    threePointMade: row.threePointMade,
    threePointAttempt: row.threePointAttempt,
    threePointPct: toNullableNumber(row.threePointPct),
    twoPointMade: row.twoPointMade,
    twoPointAttempt: row.twoPointAttempt,
    twoPointPct: toNullableNumber(row.twoPointPct),
    dunk: row.dunk,
    ftMade: row.ftMade,
    ftAttempt: row.ftAttempt,
    ftPct: toNullableNumber(row.ftPct),
    offReb: row.offReb,
    defReb: row.defReb,
    totalReb: row.totalReb,
    assists: row.assists,
    steals: row.steals,
    blocks: row.blocks,
    turnovers: row.turnovers,
    personalFouls: row.personalFouls,
    technicalFouls: row.technicalFouls,
    offensiveFouls: row.offensiveFouls,
    foulsDrawn: row.foulsDrawn,
    disqualifications: row.disqualifications,
    minutes: row.minutes ?? "",
  };
}

// --- Season management ---

export async function getSeasons(): Promise<SeasonInfo[]> {
  const rows = await db.select().from(schema.seasons);
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    default: r.isDefault || undefined,
  }));
}

export async function getDefaultSeason(): Promise<string> {
  const seasons = await getSeasons();
  const def = seasons.find((s) => s.default);
  return def ? def.id : seasons[0].id;
}

export async function getSeasonsWithData(): Promise<SeasonInfo[]> {
  const seasons = await getSeasons();
  const result: SeasonInfo[] = [];
  for (const s of seasons) {
    const [row] = await db
      .select({ id: schema.playerSummaries.id })
      .from(schema.playerSummaries)
      .where(eq(schema.playerSummaries.seasonId, s.id))
      .limit(1);
    if (row) result.push(s);
  }
  return result;
}

// --- Roster ---

export async function getRosterPlayers(season?: string): Promise<RosterPlayer[]> {
  const s = season ?? await getDefaultSeason();
  const rows = await db
    .select()
    .from(schema.roster)
    .where(eq(schema.roster.seasonId, s));
  return rows
    .map((r) => ({
      memberId: r.memberId,
      role: toRole(r.role),
      number: r.number,
      name: r.name,
      hasImage: r.hasImage,
    }))
    .sort(compareRosterPlayers);
}

// --- Player summaries ---

export async function getPlayerSummaries(season?: string): Promise<PlayerSummary[]> {
  const s = season ?? await getDefaultSeason();
  const rows = await db
    .select()
    .from(schema.playerSummaries)
    .where(eq(schema.playerSummaries.seasonId, s));
  return rows.map((r) => ({
    number: r.number,
    name: r.name,
    games: r.games,
    totalPoints: r.totalPoints,
    ppg: toNumber(r.ppg),
    threePointMade: r.threePointMade,
    threePointAttempt: r.threePointAttempt,
    threePointPct: toNullableNumber(r.threePointPct),
    twoPointMade: r.twoPointMade,
    twoPointAttempt: r.twoPointAttempt,
    twoPointPct: toNullableNumber(r.twoPointPct),
    ftMade: r.ftMade,
    ftAttempt: r.ftAttempt,
    ftPct: toNullableNumber(r.ftPct),
    offReb: r.offReb,
    defReb: r.defReb,
    totalReb: r.totalReb,
    assists: r.assists,
    steals: r.steals,
    blocks: r.blocks,
    turnovers: r.turnovers,
    personalFouls: r.personalFouls,
    foulsDrawn: r.foulsDrawn,
  }));
}

export async function getMemberList(season?: string): Promise<PlayerListEntry[]> {
  const roster = await getRosterPlayers(season);
  const summaries = await getPlayerSummaries(season);
  const summaryMap = new Map(summaries.map((summary) => [summary.number, summary]));
  return roster.map((member) => ({
    ...member,
    summary: member.number !== null && member.role === "player" ? (summaryMap.get(member.number) ?? null) : null,
  }));
}

export async function getPlayerList(season?: string): Promise<PlayerListEntry[]> {
  return getMemberList(season);
}

// --- Games ---

export async function getGameStats(season?: string): Promise<GameResult[]> {
  const s = season ?? await getDefaultSeason();
  const gameRows = await db
    .select()
    .from(schema.games)
    .where(eq(schema.games.seasonId, s));

  const results: GameResult[] = [];
  for (const g of gameRows) {
    const [playerStats, oppStats, quarters] = await Promise.all([
      db
        .select()
        .from(schema.gamePlayerStats)
        .where(and(eq(schema.gamePlayerStats.gamePk, g.id), eq(schema.gamePlayerStats.isOpponent, false))),
      db
        .select()
        .from(schema.gamePlayerStats)
        .where(and(eq(schema.gamePlayerStats.gamePk, g.id), eq(schema.gamePlayerStats.isOpponent, true))),
      db
        .select()
        .from(schema.quarterScores)
        .where(eq(schema.quarterScores.gamePk, g.id)),
    ]);

    const players = playerStats
      .map((p) => mapGamePlayerStat(p, g.gameId, g.opponent))
      .sort((a, b) => a.number - b.number);
    const opponentPlayers = oppStats
      .map((p) => mapGamePlayerStat(p, g.gameId, g.opponent))
      .sort((a, b) => a.number - b.number);
    const quarterScores: QuarterScore[] = quarters.map((q) => ({
      quarter: q.quarter,
      espoir: q.espoir,
      opponent: q.opponent,
    }));

    const gameInfo: GameInfo = {
      tournament: g.tournament,
      venue: g.venue,
      gameType: g.gameType,
    };

    results.push({
      gameId: g.gameId,
      opponent: g.opponent,
      date: g.date,
      players,
      teamPoints: g.teamPoints,
      opponentPlayers,
      opponentPoints: g.opponentPoints,
      youtubeUrl: g.youtubeUrl,
      quarterScores,
      gameInfo,
    });
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
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

export async function getGameById(gameId: string, season?: string): Promise<GameResult | null> {
  const games = await getGameStats(season);
  return games.find((g) => g.gameId === gameId) ?? null;
}

export async function getAllGameIds(season?: string): Promise<string[]> {
  return (await getGameStats(season)).map((g) => g.gameId);
}

// --- Member/Player lookups ---

export async function getMemberById(memberId: string, season?: string): Promise<PlayerProfile | null> {
  const roster = await getRosterPlayers(season);
  const member = roster.find((entry) => entry.memberId === memberId);
  if (!member) return null;

  const summaries = await getPlayerSummaries(season);
  const games = await getGameStats(season);
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

export async function findMemberAcrossSeasons(memberId: string): Promise<{ name: string; seasonIds: string[] } | null> {
  const seasons = await getSeasonsWithData();
  let name = "";
  const found: string[] = [];
  for (const s of seasons) {
    const member = (await getRosterPlayers(s.id)).find((m) => m.memberId === memberId);
    if (member) {
      name = member.name;
      found.push(s.id);
    }
  }
  return found.length > 0 ? { name, seasonIds: found } : null;
}

export async function findGameAcrossSeasons(gameId: string): Promise<{ opponent: string; date: string; seasonIds: string[] } | null> {
  const seasons = await getSeasonsWithData();
  let opponent = "";
  let date = "";
  const found: string[] = [];
  for (const s of seasons) {
    const game = await getGameById(gameId, s.id);
    if (game) {
      opponent = game.opponent;
      date = game.date;
      found.push(s.id);
    }
  }
  return found.length > 0 ? { opponent, date, seasonIds: found } : null;
}

export async function getPlayerByNumber(number: number, season?: string): Promise<PlayerProfile | null> {
  const member = (await getRosterPlayers(season)).find((entry) => entry.role === "player" && entry.number === number);
  return member ? getMemberById(member.memberId, season) : null;
}

export async function getAllMemberIds(season?: string): Promise<string[]> {
  return (await getRosterPlayers(season)).map((member) => member.memberId);
}

export async function getAllPlayerNumbers(season?: string): Promise<number[]> {
  return (await getRosterPlayers(season))
    .filter((member) => member.role === "player" && member.number !== null)
    .map((member) => member.number as number);
}

export async function getAdjacentMembers(memberId: string, season?: string): Promise<{ prev: { memberId: string; number: number | null; name: string; role: MemberRole } | null; next: { memberId: string; number: number | null; name: string; role: MemberRole } | null }> {
  const members = await getRosterPlayers(season);
  const idx = members.findIndex((member) => member.memberId === memberId);
  return {
    prev: idx > 0 ? { memberId: members[idx - 1].memberId, number: members[idx - 1].number, name: members[idx - 1].name, role: members[idx - 1].role } : null,
    next: idx < members.length - 1 ? { memberId: members[idx + 1].memberId, number: members[idx + 1].number, name: members[idx + 1].name, role: members[idx + 1].role } : null,
  };
}

export async function getAdjacentPlayers(number: number, season?: string): Promise<{ prev: { number: number; name: string } | null; next: { number: number; name: string } | null }> {
  const players = (await getRosterPlayers(season)).filter((member) => member.role === "player" && member.number !== null);
  const idx = players.findIndex((p) => p.number === number);
  const prevPlayer = idx > 0 ? players[idx - 1] : null;
  const nextPlayer = idx < players.length - 1 ? players[idx + 1] : null;
  return {
    prev: prevPlayer && prevPlayer.number !== null ? { number: prevPlayer.number, name: prevPlayer.name } : null,
    next: nextPlayer && nextPlayer.number !== null ? { number: nextPlayer.number, name: nextPlayer.name } : null,
  };
}

export async function getAdjacentGames(gameId: string, season?: string): Promise<{ prev: { gameId: string; opponent: string; date: string } | null; next: { gameId: string; opponent: string; date: string } | null }> {
  const games = await getGameStats(season);
  const idx = games.findIndex((g) => g.gameId === gameId);
  return {
    prev: idx > 0 ? { gameId: games[idx - 1].gameId, opponent: games[idx - 1].opponent, date: games[idx - 1].date } : null,
    next: idx < games.length - 1 ? { gameId: games[idx + 1].gameId, opponent: games[idx + 1].opponent, date: games[idx + 1].date } : null,
  };
}

// --- Cross-season stats ---

export async function getAllTeamSeasonStats(): Promise<TeamSeasonStats[]> {
  const seasons = [...(await getSeasonsWithData())].reverse();
  const results: TeamSeasonStats[] = [];

  for (const season of seasons) {
    const games = await getGameStats(season.id);
    const totalGames = games.length;
    const wins = games.filter((g) => g.teamPoints > g.opponentPoints).length;
    const losses = totalGames - wins;
    const totalPoints = games.reduce((s, g) => s + g.teamPoints, 0);

    let total3PM = 0, total3PA = 0, totalReb = 0, totalAst = 0, totalStl = 0, totalBlk = 0, totalTo = 0;
    const espoirTotals = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftAttempt: 0, offReb: 0, defReb: 0, turnovers: 0, points: 0, totalMinutes: 0 };
    const opponentTotals = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftAttempt: 0, offReb: 0, defReb: 0, turnovers: 0, points: 0, totalMinutes: 0 };

    for (const g of games) {
      for (const p of g.players) {
        total3PM += p.threePointMade;
        total3PA += p.threePointAttempt;
        totalReb += p.totalReb;
        totalAst += p.assists;
        totalStl += p.steals;
        totalBlk += p.blocks;
        totalTo += p.turnovers;
        espoirTotals.threePointMade += p.threePointMade;
        espoirTotals.threePointAttempt += p.threePointAttempt;
        espoirTotals.twoPointMade += p.twoPointMade;
        espoirTotals.twoPointAttempt += p.twoPointAttempt;
        espoirTotals.ftAttempt += p.ftAttempt;
        espoirTotals.offReb += p.offReb;
        espoirTotals.defReb += p.defReb;
        espoirTotals.turnovers += p.turnovers;
        espoirTotals.totalMinutes += parseMinutesToSeconds(p.minutes);
      }
      espoirTotals.points += g.teamPoints;
      opponentTotals.points += g.opponentPoints;
      for (const p of g.opponentPlayers) {
        opponentTotals.threePointMade += p.threePointMade;
        opponentTotals.threePointAttempt += p.threePointAttempt;
        opponentTotals.twoPointMade += p.twoPointMade;
        opponentTotals.twoPointAttempt += p.twoPointAttempt;
        opponentTotals.ftAttempt += p.ftAttempt;
        opponentTotals.offReb += p.offReb;
        opponentTotals.defReb += p.defReb;
        opponentTotals.turnovers += p.turnovers;
        opponentTotals.totalMinutes += parseMinutesToSeconds(p.minutes);
      }
    }

    const advanced = totalGames > 0 ? calcAdvancedStats(espoirTotals, opponentTotals) : { pace: 0, offRtg: 0, defRtg: 0, netRtg: 0 };

    results.push({
      seasonId: season.id,
      label: season.label,
      games: totalGames,
      wins,
      losses,
      totalPoints,
      avgPoints: totalGames > 0 ? totalPoints / totalGames : 0,
      threePointPct: total3PA > 0 ? (total3PM / total3PA) * 100 : null,
      totalRebounds: totalReb,
      rebounds: totalGames > 0 ? totalReb / totalGames : 0,
      totalAssists: totalAst,
      assists: totalGames > 0 ? totalAst / totalGames : 0,
      totalSteals: totalStl,
      steals: totalGames > 0 ? totalStl / totalGames : 0,
      totalBlocks: totalBlk,
      blocks: totalGames > 0 ? totalBlk / totalGames : 0,
      totalTurnovers: totalTo,
      turnovers: totalGames > 0 ? totalTo / totalGames : 0,
      pace: advanced.pace,
      offRtg: advanced.offRtg,
      defRtg: advanced.defRtg,
      netRtg: advanced.netRtg,
    });
  }

  return results;
}

export async function getAllPlayerSeasonStats(): Promise<CrossSeasonMember[]> {
  const seasons = [...(await getSeasonsWithData())].reverse();
  const memberMap = new Map<string, CrossSeasonMember>();

  for (const season of seasons) {
    const roster = await getRosterPlayers(season.id);
    const summaries = await getPlayerSummaries(season.id);
    const summaryMap = new Map(summaries.map((s) => [s.number, s]));

    for (const member of roster) {
      const summary = member.number !== null && member.role === "player" ? (summaryMap.get(member.number) ?? null) : null;

      const totalEff = summary ? calcEff({
        points: summary.totalPoints, totalReb: summary.totalReb, assists: summary.assists, steals: summary.steals, blocks: summary.blocks,
        threePointMade: summary.threePointMade, threePointAttempt: summary.threePointAttempt,
        twoPointMade: summary.twoPointMade, twoPointAttempt: summary.twoPointAttempt,
        ftMade: summary.ftMade, ftAttempt: summary.ftAttempt, turnovers: summary.turnovers,
      }) : 0;

      const playerSeason: PlayerSeasonStats = {
        seasonId: season.id,
        label: season.label,
        memberId: member.memberId,
        name: member.name,
        number: member.number,
        role: member.role,
        games: summary?.games ?? 0,
        totalPoints: summary?.totalPoints ?? 0,
        ppg: summary?.ppg ?? 0,
        totalRebounds: summary?.totalReb ?? 0,
        rpg: summary && summary.games > 0 ? summary.totalReb / summary.games : 0,
        totalAssists: summary?.assists ?? 0,
        apg: summary && summary.games > 0 ? summary.assists / summary.games : 0,
        totalSteals: summary?.steals ?? 0,
        spg: summary && summary.games > 0 ? summary.steals / summary.games : 0,
        totalBlocks: summary?.blocks ?? 0,
        bpg: summary && summary.games > 0 ? summary.blocks / summary.games : 0,
        totalTurnovers: summary?.turnovers ?? 0,
        topg: summary && summary.games > 0 ? summary.turnovers / summary.games : 0,
        totalPersonalFouls: summary?.personalFouls ?? 0,
        pfpg: summary && summary.games > 0 ? summary.personalFouls / summary.games : 0,
        totalFoulsDrawn: summary?.foulsDrawn ?? 0,
        fdpg: summary && summary.games > 0 ? summary.foulsDrawn / summary.games : 0,
        threePointPct: summary?.threePointPct ?? null,
        twoPointPct: summary?.twoPointPct ?? null,
        ftPct: summary?.ftPct ?? null,
        eff: totalEff,
        avgEff: summary && summary.games > 0 ? totalEff / summary.games : 0,
      };

      if (!memberMap.has(member.memberId)) {
        memberMap.set(member.memberId, {
          memberId: member.memberId,
          name: member.name,
          number: member.number,
          role: member.role,
          seasons: [playerSeason],
        });
      } else {
        const existing = memberMap.get(member.memberId)!;
        existing.name = member.name;
        existing.number = member.number;
        existing.role = member.role;
        existing.seasons.push(playerSeason);
      }
    }
  }

  return Array.from(memberMap.values());
}
