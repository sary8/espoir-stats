import { describe, it, expect } from "vitest";
import { getPlayerSummaries, getGameStats, getPlayerByNumber, getAllPlayerNumbers } from "./data";

describe("getPlayerSummaries", () => {
  const summaries = getPlayerSummaries();

  it("選手データを返す", () => {
    expect(summaries.length).toBeGreaterThan(0);
  });

  it("各選手に必要なフィールドがある", () => {
    for (const p of summaries) {
      expect(p.number).toBeTypeOf("number");
      expect(p.name).toBeTypeOf("string");
      expect(p.games).toBeTypeOf("number");
      expect(p.totalPoints).toBeTypeOf("number");
      expect(p.ppg).toBeTypeOf("number");
    }
  });

  it("PF/FOが集計されている", () => {
    const hasAnyFouls = summaries.some((p) => p.personalFouls > 0);
    expect(hasAnyFouls).toBe(true);
  });
});

describe("getGameStats", () => {
  const games = getGameStats();

  it("試合データを返す", () => {
    expect(games.length).toBeGreaterThan(0);
  });

  it("各試合に必要なフィールドがある", () => {
    for (const g of games) {
      expect(g.opponent).toBeTypeOf("string");
      expect(g.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(g.players.length).toBeGreaterThan(0);
      expect(g.teamPoints).toBeTypeOf("number");
    }
  });

  it("日付順にソートされている", () => {
    for (let i = 1; i < games.length; i++) {
      expect(games[i].date >= games[i - 1].date).toBe(true);
    }
  });

  it("チーム合計得点が選手の得点合計と一致する", () => {
    for (const g of games) {
      const sum = g.players.reduce((acc, p) => acc + p.points, 0);
      expect(g.teamPoints).toBe(sum);
    }
  });
});

describe("getPlayerByNumber", () => {
  it("存在する選手番号でデータを返す", () => {
    const numbers = getAllPlayerNumbers();
    const result = getPlayerByNumber(numbers[0]);
    expect(result).not.toBeNull();
    expect(result!.summary.number).toBe(numbers[0]);
  });

  it("存在しない選手番号でnullを返す", () => {
    const result = getPlayerByNumber(99999);
    expect(result).toBeNull();
  });
});

describe("getAllPlayerNumbers", () => {
  it("背番号の配列を返す", () => {
    const numbers = getAllPlayerNumbers();
    expect(numbers.length).toBeGreaterThan(0);
    for (const n of numbers) {
      expect(n).toBeTypeOf("number");
    }
  });
});
