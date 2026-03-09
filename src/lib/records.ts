import type {
  CareerTotals,
  AllTimeSingleGameRecord,
  Award,
  CrossSeasonMember,
  SeasonInfo,
  GameResult,
  GamePlayerStat,
  RosterPlayer,
} from "./types";
import { calcEff } from "./stats";

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

export function getCareerTotals(
  crossSeasonMembers: CrossSeasonMember[],
): CareerTotals[] {
  return crossSeasonMembers
    .filter((m) => m.role === "player")
    .map((m) => {
      let games = 0;
      let totalPoints = 0;
      let totalRebounds = 0;
      let totalAssists = 0;
      let totalSteals = 0;
      let totalBlocks = 0;
      let totalTurnovers = 0;
      let totalPersonalFouls = 0;
      let totalFoulsDrawn = 0;
      let totalEff = 0;
      let seasonsPlayed = 0;

      for (const s of m.seasons) {
        if (s.games === 0) continue;
        seasonsPlayed++;
        games += s.games;
        totalPoints += s.totalPoints;
        totalRebounds += s.totalRebounds;
        totalAssists += s.totalAssists;
        totalSteals += s.totalSteals;
        totalBlocks += s.totalBlocks;
        totalTurnovers += s.totalTurnovers;
        totalPersonalFouls += s.totalPersonalFouls;
        totalFoulsDrawn += s.totalFoulsDrawn;
        totalEff += s.eff;
      }

      return {
        memberId: m.memberId,
        name: m.name,
        number: m.number,
        seasonsPlayed,
        games,
        totalPoints,
        ppg: games > 0 ? totalPoints / games : 0,
        totalRebounds,
        rpg: games > 0 ? totalRebounds / games : 0,
        totalAssists,
        apg: games > 0 ? totalAssists / games : 0,
        totalSteals,
        spg: games > 0 ? totalSteals / games : 0,
        totalBlocks,
        bpg: games > 0 ? totalBlocks / games : 0,
        totalTurnovers,
        topg: games > 0 ? totalTurnovers / games : 0,
        totalPersonalFouls,
        pfpg: games > 0 ? totalPersonalFouls / games : 0,
        totalFoulsDrawn,
        fdpg: games > 0 ? totalFoulsDrawn / games : 0,
        totalEff,
        avgEff: games > 0 ? totalEff / games : 0,
      };
    })
    .filter((c) => c.games > 0);
}

export function getAllTimeSingleGameRecords(
  seasonsWithData: SeasonInfo[],
  getGameStatsFn: (season: string) => GameResult[],
  getRosterPlayersFn: (season: string) => RosterPlayer[],
): AllTimeSingleGameRecord[] {
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
    { title: "1試合最多ファール", getValue: (p) => p.personalFouls },
    { title: "1試合最多ターンオーバー", getValue: (p) => p.turnovers },
    { title: "1試合最多ファールドローン", getValue: (p) => p.foulsDrawn },
  ];

  const best = categories.map(() => ({
    value: -Infinity,
    player: null as GamePlayerStat | null,
    opponent: "",
    date: "",
    seasonLabel: "",
    memberId: "",
  }));

  for (const season of seasonsWithData) {
    const games = getGameStatsFn(season.id);
    const roster = getRosterPlayersFn(season.id);
    const rosterByNumber = new Map(
      roster
        .filter((m) => m.role === "player" && m.number !== null)
        .map((m) => [m.number, m]),
    );

    for (const game of games) {
      for (const p of game.players) {
        for (let i = 0; i < categories.length; i++) {
          const val = categories[i].getValue(p);
          if (val > best[i].value) {
            const member = rosterByNumber.get(p.number);
            best[i] = {
              value: val,
              player: p,
              opponent: game.opponent,
              date: game.date,
              seasonLabel: season.label,
              memberId: member?.memberId ?? String(p.number),
            };
          }
        }
      }
    }
  }

  const records: AllTimeSingleGameRecord[] = [];
  for (let i = 0; i < categories.length; i++) {
    const b = best[i];
    if (!b.player || b.value <= 0) continue;
    records.push({
      title: categories[i].title,
      memberId: b.memberId,
      playerName: b.player.name,
      playerNumber: b.player.number,
      value: b.value,
      opponent: b.opponent,
      date: b.date,
      seasonLabel: b.seasonLabel,
    });
  }

  return records;
}

export function getAllMilestones(
  crossSeasonMembers: CrossSeasonMember[],
  seasonsWithData: SeasonInfo[],
  getGameStatsFn: (season: string) => GameResult[],
): Award[] {
  const milestoneDefs = [
    {
      title: "通算100得点達成",
      threshold: 100,
      getSeasonTotal: (s: CrossSeasonMember["seasons"][0]) => s.totalPoints,
      getGameValue: (game: GameResult, num: number) => {
        const p = game.players.find((pl) => pl.number === num);
        return p ? p.points : 0;
      },
    },
    {
      title: "通算50試合出場",
      threshold: 50,
      getSeasonTotal: (s: CrossSeasonMember["seasons"][0]) => s.games,
      getGameValue: (game: GameResult, num: number) => {
        return game.players.some((pl) => pl.number === num) ? 1 : 0;
      },
    },
  ];

  const sortedSeasonIds = [...seasonsWithData]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => s.id);

  const awards: Award[] = [];

  for (const member of crossSeasonMembers) {
    if (member.role !== "player" || member.number === null) continue;

    const sortedSeasons = [...member.seasons].sort((a, b) =>
      a.seasonId.localeCompare(b.seasonId),
    );

    for (const def of milestoneDefs) {
      let cumulative = 0;
      let achieved = false;
      let achievedSeasonId = "";

      for (const seasonId of sortedSeasonIds) {
        const ss = sortedSeasons.find((s) => s.seasonId === seasonId);
        if (!ss) continue;
        const prev = cumulative;
        cumulative += def.getSeasonTotal(ss);
        if (cumulative >= def.threshold && prev < def.threshold) {
          achievedSeasonId = seasonId;
          achieved = true;
          break;
        }
      }

      if (!achieved) continue;

      // 達成した試合を特定
      let runningTotal = 0;
      // 達成シーズンまでの前シーズン分を計算
      for (const ss of sortedSeasons) {
        if (ss.seasonId === achievedSeasonId) break;
        runningTotal += def.getSeasonTotal(ss);
      }

      let achievedGame: GameResult | null = null;
      const games = getGameStatsFn(achievedSeasonId);
      const sortedGames = [...games].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      for (const game of sortedGames) {
        runningTotal += def.getGameValue(game, member.number);
        if (runningTotal >= def.threshold) {
          achievedGame = game;
          break;
        }
      }

      const seasonInfo = seasonsWithData.find(
        (s) => s.id === achievedSeasonId,
      );

      awards.push({
        category: "milestone",
        title: def.title,
        memberId: member.memberId,
        playerName: member.name,
        playerNumber: member.number,
        value: cumulative,
        detail: achievedGame
          ? `vs ${achievedGame.opponent} (${achievedGame.date.replace(/-/g, "/")}) - ${seasonInfo?.label ?? achievedSeasonId}`
          : seasonInfo?.label ?? achievedSeasonId,
      });
    }
  }

  return awards;
}
