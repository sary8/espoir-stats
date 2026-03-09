import { describe, it, expect } from "vitest";
import { calcEff, calcTeamPossEst, calcAdvancedStats, parseMinutesToSeconds, type EffInput, type TeamTotals } from "./stats";

describe("parseMinutesToSeconds", () => {
  it("MM:SS 形式を秒数に変換する", () => {
    expect(parseMinutesToSeconds("10:30")).toBe(630);
    expect(parseMinutesToSeconds("0:00")).toBe(0);
    expect(parseMinutesToSeconds("40:00")).toBe(2400);
    expect(parseMinutesToSeconds("1:05")).toBe(65);
  });

  it("秒部分がない場合は0として扱う", () => {
    expect(parseMinutesToSeconds("10")).toBe(600);
    expect(parseMinutesToSeconds("10:")).toBe(600);
  });

  it("空文字列は0を返す", () => {
    expect(parseMinutesToSeconds("")).toBe(0);
  });
});

describe("calcEff", () => {
  const base: EffInput = {
    points: 0,
    totalReb: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    threePointMade: 0,
    threePointAttempt: 0,
    twoPointMade: 0,
    twoPointAttempt: 0,
    ftMade: 0,
    ftAttempt: 0,
    turnovers: 0,
  };

  it("全て0の場合はEFF=0", () => {
    expect(calcEff(base)).toBe(0);
  });

  it("得点・リバウンド・アシストがプラスに貢献する", () => {
    const input = { ...base, points: 20, totalReb: 10, assists: 5 };
    expect(calcEff(input)).toBe(35);
  });

  it("FGミス・FTミス・TOがマイナスに貢献する", () => {
    const input = {
      ...base,
      twoPointAttempt: 10,
      twoPointMade: 4,
      ftAttempt: 6,
      ftMade: 3,
      turnovers: 3,
    };
    // -(10-4) - (6-3) - 3 = -6 -3 -3 = -12
    expect(calcEff(input)).toBe(-12);
  });

  it("実際的なスタットラインを正しく計算する", () => {
    const input: EffInput = {
      points: 25,
      totalReb: 8,
      assists: 6,
      steals: 2,
      blocks: 1,
      threePointMade: 3,
      threePointAttempt: 7,
      twoPointMade: 5,
      twoPointAttempt: 10,
      ftMade: 2,
      ftAttempt: 3,
      turnovers: 3,
    };
    // positive: 25 + 8 + 6 + 2 + 1 = 42
    // fga = 7 + 10 = 17, fgm = 3 + 5 = 8, miss = 9
    // ft miss = 1, TO = 3
    // negative: 9 + 1 + 3 = 13
    // EFF = 42 - 13 = 29
    expect(calcEff(input)).toBe(29);
  });
});

describe("calcTeamPossEst", () => {
  it("全て0ならポゼッション0", () => {
    const team = {
      threePointMade: 0,
      threePointAttempt: 0,
      twoPointMade: 0,
      twoPointAttempt: 0,
      ftAttempt: 0,
      offReb: 0,
      turnovers: 0,
    };
    expect(calcTeamPossEst(team, 0)).toBe(0);
  });

  it("FGAとTOのみの場合の計算", () => {
    const team = {
      threePointMade: 0,
      threePointAttempt: 10,
      twoPointMade: 0,
      twoPointAttempt: 20,
      ftAttempt: 0,
      offReb: 0,
      turnovers: 5,
    };
    // fga=30, fgm=0, offReb=0 → orebFactor=0
    // poss = 30 + 0 - 0 + 5 = 35
    expect(calcTeamPossEst(team, 10)).toBe(35);
  });

  it("オフェンスリバウンドがポゼッションを減らす", () => {
    const team = {
      threePointMade: 5,
      threePointAttempt: 15,
      twoPointMade: 10,
      twoPointAttempt: 25,
      ftAttempt: 10,
      offReb: 8,
      turnovers: 10,
    };
    const oppDefReb = 12;
    const result = calcTeamPossEst(team, oppDefReb);
    // fga=40, fgm=15, orebFactor=8/(8+12)=0.4
    // poss = 40 + 0.4*10 - 1.07*0.4*(40-15) + 10
    // = 40 + 4 - 1.07*0.4*25 + 10 = 40 + 4 - 10.7 + 10 = 43.3
    expect(result).toBeCloseTo(43.3, 1);
  });
});

describe("calcAdvancedStats", () => {
  const makeTeam = (overrides: Partial<TeamTotals> = {}): TeamTotals => ({
    threePointMade: 5,
    threePointAttempt: 15,
    twoPointMade: 15,
    twoPointAttempt: 30,
    ftAttempt: 10,
    offReb: 8,
    defReb: 20,
    turnovers: 12,
    points: 70,
    totalMinutes: 12000, // 200分 = 12000秒
    ...overrides,
  });

  it("OffRtg と DefRtg を返す", () => {
    const espoir = makeTeam({ points: 80 });
    const opponent = makeTeam({ points: 70 });
    const result = calcAdvancedStats(espoir, opponent);
    expect(result.offRtg).toBeGreaterThan(0);
    expect(result.defRtg).toBeGreaterThan(0);
  });

  it("NetRtg は OffRtg - DefRtg", () => {
    const espoir = makeTeam({ points: 80 });
    const opponent = makeTeam({ points: 70 });
    const result = calcAdvancedStats(espoir, opponent);
    expect(result.netRtg).toBeCloseTo(result.offRtg - result.defRtg, 5);
  });

  it("得点が多いチームは OffRtg が高い", () => {
    const opponent = makeTeam({ points: 70 });
    const high = calcAdvancedStats(makeTeam({ points: 90 }), opponent);
    const low = calcAdvancedStats(makeTeam({ points: 60 }), opponent);
    expect(high.offRtg).toBeGreaterThan(low.offRtg);
  });

  it("poss は四捨五入された整数", () => {
    const result = calcAdvancedStats(makeTeam(), makeTeam());
    expect(Number.isInteger(result.poss)).toBe(true);
  });

  it("totalMinutes が 0 の場合 pace は 0", () => {
    const espoir = makeTeam({ totalMinutes: 0 });
    const opponent = makeTeam();
    const result = calcAdvancedStats(espoir, opponent);
    expect(result.pace).toBe(0);
  });
});
