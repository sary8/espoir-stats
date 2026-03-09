import type {
  Award,
  SeasonAwardSet,
  PlayerSummary,
  GameResult,
  GamePlayerStat,
  RosterPlayer,
  CrossSeasonMember,
} from "./types";
import { calcEff } from "./stats";

function findRosterMember(
  roster: RosterPlayer[],
  number: number,
): RosterPlayer | undefined {
  return roster.find((m) => m.role === "player" && m.number === number);
}

function calcGameEff(s: GamePlayerStat): number {
  return calcEff({
    points: s.points,
    totalReb: s.totalReb,
    assists: s.assists,
    steals: s.steals,
    blocks: s.blocks,
    threePointMade: s.threePointMade,
    threePointAttempt: s.threePointAttempt,
    twoPointMade: s.twoPointMade,
    twoPointAttempt: s.twoPointAttempt,
    ftMade: s.ftMade,
    ftAttempt: s.ftAttempt,
    turnovers: s.turnovers,
  });
}

function calcPlayerEff(s: PlayerSummary): number {
  return calcEff({
    points: s.totalPoints,
    totalReb: s.totalReb,
    assists: s.assists,
    steals: s.steals,
    blocks: s.blocks,
    threePointMade: s.threePointMade,
    threePointAttempt: s.threePointAttempt,
    twoPointMade: s.twoPointMade,
    twoPointAttempt: s.twoPointAttempt,
    ftMade: s.ftMade,
    ftAttempt: s.ftAttempt,
    turnovers: s.turnovers,
  });
}

export function getCategoryLeaders(
  players: PlayerSummary[],
  roster: RosterPlayer[],
): Award[] {
  if (players.length === 0) return [];

  const categories: {
    title: string;
    getValue: (p: PlayerSummary) => number;
  }[] = [
    { title: "得点王", getValue: (p) => p.ppg },
    { title: "3P王", getValue: (p) => p.threePointMade },
    { title: "リバウンド王", getValue: (p) => p.totalReb },
    { title: "アシスト王", getValue: (p) => p.assists },
    { title: "スティール王", getValue: (p) => p.steals },
    { title: "ブロック王", getValue: (p) => p.blocks },
    { title: "EFF王", getValue: (p) => (p.games > 0 ? calcPlayerEff(p) / p.games : 0) },
  ];

  const awards: Award[] = [];
  for (const cat of categories) {
    const sorted = [...players].sort(
      (a, b) => cat.getValue(b) - cat.getValue(a),
    );
    const top = sorted[0];
    if (cat.getValue(top) <= 0) continue;
    const member = findRosterMember(roster, top.number);
    awards.push({
      category: "category-leader",
      title: cat.title,
      memberId: member?.memberId ?? String(top.number),
      playerName: top.name,
      playerNumber: top.number,
      value: Math.round(cat.getValue(top) * 10) / 10,
    });
  }

  return awards;
}

export function getBestGameRecords(
  games: GameResult[],
  roster: RosterPlayer[],
): Award[] {
  const categories: {
    title: string;
    getValue: (p: GamePlayerStat) => number;
  }[] = [
    { title: "1試合最多得点", getValue: (p) => p.points },
    { title: "1試合最多3P", getValue: (p) => p.threePointMade },
    { title: "1試合最高EFF", getValue: (p) => calcGameEff(p) },
    { title: "1試合最多リバウンド", getValue: (p) => p.totalReb },
    { title: "1試合最多アシスト", getValue: (p) => p.assists },
    { title: "1試合最多スティール", getValue: (p) => p.steals },
  ];

  const awards: Award[] = [];
  for (const cat of categories) {
    let bestPlayer: GamePlayerStat | null = null;
    let bestValue = -Infinity;
    let bestOpponent = "";
    let bestDate = "";

    for (const game of games) {
      for (const p of game.players) {
        const val = cat.getValue(p);
        if (val > bestValue) {
          bestValue = val;
          bestPlayer = p;
          bestOpponent = game.opponent;
          bestDate = game.date;
        }
      }
    }

    if (!bestPlayer || bestValue <= 0) continue;
    const member = findRosterMember(roster, bestPlayer.number);
    awards.push({
      category: "best-game",
      title: cat.title,
      memberId: member?.memberId ?? String(bestPlayer.number),
      playerName: bestPlayer.name,
      playerNumber: bestPlayer.number,
      value: bestValue,
      detail: `vs ${bestOpponent} (${bestDate.replace(/-/g, "/")})`,
    });
  }

  return awards;
}

export function getSeasonMVP(
  players: PlayerSummary[],
  roster: RosterPlayer[],
): Award | null {
  if (players.length === 0) return null;

  const withAvgEff = players
    .filter((p) => p.games > 0)
    .map((p) => ({
      player: p,
      avgEff: calcPlayerEff(p) / p.games,
    }))
    .sort((a, b) => b.avgEff - a.avgEff);

  if (withAvgEff.length === 0) return null;

  const top = withAvgEff[0];
  const member = findRosterMember(roster, top.player.number);
  return {
    category: "mvp",
    title: "Season MVP",
    memberId: member?.memberId ?? String(top.player.number),
    playerName: top.player.name,
    playerNumber: top.player.number,
    value: Math.round(top.avgEff * 10) / 10,
    detail: `AVG EFF ${(Math.round(top.avgEff * 10) / 10).toFixed(1)}`,
  };
}

export function getMilestones(
  crossSeasonMembers: CrossSeasonMember[],
): Award[] {
  const milestones: {
    title: string;
    threshold: number;
    getValue: (m: CrossSeasonMember) => number;
  }[] = [
    {
      title: "通算100得点達成",
      threshold: 100,
      getValue: (m) => m.seasons.reduce((s, ss) => s + ss.totalPoints, 0),
    },
    {
      title: "通算50試合出場",
      threshold: 50,
      getValue: (m) => m.seasons.reduce((s, ss) => s + ss.games, 0),
    },
    {
      title: "3P通算50本達成",
      threshold: 50,
      getValue: (m) => {
        let total = 0;
        for (const ss of m.seasons) {
          total += Math.round(
            (ss.threePointPct ?? 0) > 0
              ? ss.totalPoints * 0
              : 0,
          );
        }
        return total;
      },
    },
  ];

  // For 3P milestone, we need a different approach - use season stats data
  // The CrossSeasonMember doesn't have threePointMade directly, so we'll use a simpler approach
  const awards: Award[] = [];

  // Points milestone
  for (const member of crossSeasonMembers) {
    if (member.role !== "player") continue;
    const totalPoints = member.seasons.reduce((s, ss) => s + ss.totalPoints, 0);
    if (totalPoints >= 100) {
      awards.push({
        category: "milestone",
        title: "通算100得点達成",
        memberId: member.memberId,
        playerName: member.name,
        playerNumber: member.number,
        value: totalPoints,
      });
    }
  }

  // Games milestone
  for (const member of crossSeasonMembers) {
    if (member.role !== "player") continue;
    const totalGames = member.seasons.reduce((s, ss) => s + ss.games, 0);
    if (totalGames >= 50) {
      awards.push({
        category: "milestone",
        title: "通算50試合出場",
        memberId: member.memberId,
        playerName: member.name,
        playerNumber: member.number,
        value: totalGames,
      });
    }
  }

  return awards;
}

export function getSeasonAwards(
  players: PlayerSummary[],
  games: GameResult[],
  roster: RosterPlayer[],
  crossSeasonMembers: CrossSeasonMember[],
): SeasonAwardSet {
  return {
    mvp: getSeasonMVP(players, roster),
    categoryLeaders: getCategoryLeaders(players, roster),
    bestGameRecords: getBestGameRecords(games, roster),
    milestones: getMilestones(crossSeasonMembers),
  };
}

export function getPlayerAwards(
  memberId: string,
  awards: SeasonAwardSet,
): Award[] {
  const all = [
    ...(awards.mvp ? [awards.mvp] : []),
    ...awards.categoryLeaders,
    ...awards.bestGameRecords,
    ...awards.milestones,
  ];
  return all.filter((a) => a.memberId === memberId);
}
