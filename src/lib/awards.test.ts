import { describe, it, expect } from "vitest";
import {
  getCategoryLeaders,
  getBestGameRecords,
  getSeasonMVP,
  getMilestones,
  getPlayerAwards,
} from "./awards";
import type {
  PlayerSummary,
  GameResult,
  RosterPlayer,
  CrossSeasonMember,
  SeasonAwardSet,
} from "./types";

function makePlayer(overrides: Partial<PlayerSummary> = {}): PlayerSummary {
  return {
    number: 1,
    name: "テスト選手",
    games: 5,
    totalPoints: 50,
    ppg: 10,
    threePointMade: 10,
    threePointAttempt: 20,
    threePointPct: 50,
    twoPointMade: 10,
    twoPointAttempt: 20,
    twoPointPct: 50,
    ftMade: 5,
    ftAttempt: 10,
    ftPct: 50,
    offReb: 5,
    defReb: 15,
    totalReb: 20,
    assists: 15,
    steals: 8,
    blocks: 3,
    turnovers: 10,
    personalFouls: 10,
    foulsDrawn: 5,
    ...overrides,
  };
}

function makeRoster(number: number, memberId?: string): RosterPlayer {
  return {
    memberId: memberId ?? String(number),
    role: "player",
    number,
    name: `選手${number}`,
    hasImage: false,
  };
}

describe("getCategoryLeaders", () => {
  it("各カテゴリの1位を正しく算出する", () => {
    const players = [
      makePlayer({ number: 1, name: "A", ppg: 20, threePointMade: 5 }),
      makePlayer({ number: 2, name: "B", ppg: 15, threePointMade: 30 }),
    ];
    const roster = [makeRoster(1), makeRoster(2)];

    const awards = getCategoryLeaders(players, roster);
    const scorer = awards.find((a) => a.title === "得点王");
    expect(scorer).toBeDefined();
    expect(scorer!.playerNumber).toBe(1);

    const threeP = awards.find((a) => a.title === "3P王");
    expect(threeP).toBeDefined();
    expect(threeP!.playerNumber).toBe(2);
  });

  it("空の選手リストでは空配列を返す", () => {
    expect(getCategoryLeaders([], [])).toEqual([]);
  });

  it("7種類のアワードを返す", () => {
    const players = [
      makePlayer({ number: 1 }),
      makePlayer({ number: 2 }),
    ];
    const roster = [makeRoster(1), makeRoster(2)];
    const awards = getCategoryLeaders(players, roster);
    expect(awards.length).toBe(7);
  });
});

describe("getBestGameRecords", () => {
  it("1試合最多得点を正しく算出する", () => {
    const games: GameResult[] = [
      {
        gameId: "g1",
        opponent: "チームA",
        date: "2025-01-01",
        players: [
          {
            gameId: "g1", opponent: "チームA", number: 1, name: "選手1",
            starter: true, points: 30, threePointMade: 3, threePointAttempt: 5,
            twoPointMade: 8, twoPointAttempt: 15, dunk: 0,
            ftMade: 3, ftAttempt: 4, ftPct: 75,
            threePointPct: 60, twoPointPct: 53.3,
            offReb: 2, defReb: 5, totalReb: 7,
            assists: 4, steals: 2, blocks: 1, turnovers: 3,
            personalFouls: 2, technicalFouls: 0, offensiveFouls: 0,
            foulsDrawn: 3, disqualifications: 0, minutes: "30:00",
          },
        ],
        teamPoints: 80,
        opponentPlayers: [],
        opponentPoints: 70,
        youtubeUrl: null,
        quarterScores: [],
        gameInfo: { tournament: null, venue: null, gameType: null },
      },
    ];
    const roster = [makeRoster(1)];
    const awards = getBestGameRecords(games, roster);
    const topScorer = awards.find((a) => a.title === "1試合最多得点");
    expect(topScorer).toBeDefined();
    expect(topScorer!.value).toBe(30);
    expect(topScorer!.detail).toContain("チームA");
  });

  it("空の試合リストでは空配列を返す", () => {
    expect(getBestGameRecords([], [])).toEqual([]);
  });
});

describe("getSeasonMVP", () => {
  it("平均EFF最高の選手をMVPに選出する", () => {
    const player1 = makePlayer({ number: 1, name: "MVP候補A", games: 5, totalPoints: 100, totalReb: 50, assists: 30, steals: 10, blocks: 5, threePointMade: 10, threePointAttempt: 20, twoPointMade: 30, twoPointAttempt: 50, ftMade: 10, ftAttempt: 12, turnovers: 5 });
    const player2 = makePlayer({ number: 2, name: "MVP候補B", games: 5, totalPoints: 30, totalReb: 10, assists: 5, steals: 2, blocks: 1, threePointMade: 2, threePointAttempt: 10, twoPointMade: 8, twoPointAttempt: 20, ftMade: 4, ftAttempt: 8, turnovers: 10 });
    const roster = [makeRoster(1), makeRoster(2)];

    const mvp = getSeasonMVP([player1, player2], roster);
    expect(mvp).not.toBeNull();
    expect(mvp!.playerNumber).toBe(1);
    expect(mvp!.category).toBe("mvp");
  });

  it("空リストではnullを返す", () => {
    expect(getSeasonMVP([], [])).toBeNull();
  });
});

describe("getMilestones", () => {
  it("通算100得点達成を検出する", () => {
    const members: CrossSeasonMember[] = [
      {
        memberId: "1",
        name: "選手1",
        number: 1,
        role: "player",
        seasons: [
          { seasonId: "s1", label: "S1", memberId: "1", name: "選手1", number: 1, role: "player", games: 10, totalPoints: 60, ppg: 6, totalRebounds: 10, rpg: 1, totalAssists: 5, apg: 0.5, totalSteals: 3, spg: 0.3, totalBlocks: 1, bpg: 0.1, threePointPct: 30, twoPointPct: 40, ftPct: 70, eff: 20, avgEff: 2 },
          { seasonId: "s2", label: "S2", memberId: "1", name: "選手1", number: 1, role: "player", games: 10, totalPoints: 50, ppg: 5, totalRebounds: 10, rpg: 1, totalAssists: 5, apg: 0.5, totalSteals: 3, spg: 0.3, totalBlocks: 1, bpg: 0.1, threePointPct: 30, twoPointPct: 40, ftPct: 70, eff: 20, avgEff: 2 },
        ],
      },
    ];
    const awards = getMilestones(members);
    const pts100 = awards.find((a) => a.title === "通算100得点達成");
    expect(pts100).toBeDefined();
    expect(pts100!.value).toBe(110);
  });

  it("閾値未満の選手はマイルストーンなし", () => {
    const members: CrossSeasonMember[] = [
      {
        memberId: "1",
        name: "選手1",
        number: 1,
        role: "player",
        seasons: [
          { seasonId: "s1", label: "S1", memberId: "1", name: "選手1", number: 1, role: "player", games: 5, totalPoints: 20, ppg: 4, totalRebounds: 5, rpg: 1, totalAssists: 2, apg: 0.4, totalSteals: 1, spg: 0.2, totalBlocks: 0, bpg: 0, threePointPct: 20, twoPointPct: 30, ftPct: 50, eff: 5, avgEff: 1 },
        ],
      },
    ];
    const awards = getMilestones(members);
    expect(awards.length).toBe(0);
  });
});

describe("getPlayerAwards", () => {
  it("特定選手のアワードのみ返す", () => {
    const awardSet: SeasonAwardSet = {
      mvp: { category: "mvp", title: "Season MVP", memberId: "1", playerName: "選手1", playerNumber: 1, value: 15 },
      categoryLeaders: [
        { category: "category-leader", title: "得点王", memberId: "1", playerName: "選手1", playerNumber: 1, value: 20 },
        { category: "category-leader", title: "3P王", memberId: "2", playerName: "選手2", playerNumber: 2, value: 30 },
      ],
      bestGameRecords: [],
      milestones: [],
    };
    const awards = getPlayerAwards("1", awardSet);
    expect(awards.length).toBe(2);
    expect(awards.every((a) => a.memberId === "1")).toBe(true);
  });
});
