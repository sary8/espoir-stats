import { describe, it, expect } from "vitest";
import { getPlayerSummaries, getGameStats, getPlayerByNumber, getAllPlayerNumbers, getGameById, getAllGameIds, getRosterPlayers, getMemberList, getMemberById, getAllMemberIds } from "./data";

function parseMinutes(value: string): number {
  const [m, s = "0"] = value.split(":");
  return (parseInt(m || "0", 10) * 60) + parseInt(s || "0", 10);
}

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
      expect(g.gameId).toBeTypeOf("string");
      expect(g.opponent).toBeTypeOf("string");
      expect(g.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(g.players.length).toBeGreaterThan(0);
      expect(g.teamPoints).toBeTypeOf("number");
    }
  });

  it("日付順にソートされている", () => {
    for (let i = 1; i < games.length; i++) {
      expect(games[i].date <= games[i - 1].date).toBe(true);
    }
  });

  it("チーム合計得点が選手の得点合計と一致する", () => {
    for (const g of games) {
      const sum = g.players.reduce((acc, p) => acc + p.points, 0);
      expect(g.teamPoints).toBe(sum);
    }
  });

  it("相手チームデータが含まれている", () => {
    for (const g of games) {
      expect(g.opponentPlayers).toBeDefined();
      expect(g.opponentPoints).toBeTypeOf("number");
    }
  });

  it("相手チーム合計得点が選手の得点合計と一致する", () => {
    for (const g of games) {
      if (g.opponentPlayers.length > 0) {
        const sum = g.opponentPlayers.reduce((acc, p) => acc + p.points, 0);
        expect(g.opponentPoints).toBe(sum);
      }
    }
  });

  it("gameId が一意である", () => {
    const unique = new Set(games.map((g) => g.gameId));
    expect(unique.size).toBe(games.length);
  });

  it("自チームの合計出場時間が160分である", () => {
    for (const g of games) {
      const total = g.players
        .filter((p) => p.name !== "Team/Coaches")
        .reduce((sum, p) => sum + parseMinutes(p.minutes), 0);
      expect(total).toBe(160 * 60);
    }
  });

  it("相手チームの合計出場時間が160分である", () => {
    for (const g of games) {
      if (g.opponentPlayers.length === 0) continue;
      const total = g.opponentPlayers
        .filter((p) => p.name !== "Team/Coaches")
        .reduce((sum, p) => sum + parseMinutes(p.minutes), 0);
      expect(total).toBe(160 * 60);
    }
  });
});

describe("getGameById", () => {
  it("存在する試合IDで試合データを返す", () => {
    const gameIds = getAllGameIds();
    const game = getGameById(gameIds[0]);
    expect(game).not.toBeNull();
    expect(game!.gameId).toBe(gameIds[0]);
  });

  it("存在しない試合IDでnullを返す", () => {
    const game = getGameById("存在しない試合ID");
    expect(game).toBeNull();
  });
});

describe("getAllGameIds", () => {
  it("試合IDの配列を返す", () => {
    const gameIds = getAllGameIds();
    expect(gameIds.length).toBeGreaterThan(0);
    for (const id of gameIds) {
      expect(id).toBeTypeOf("string");
    }
  });
});

describe("getPlayerByNumber", () => {
  it("存在する選手番号でデータを返す", () => {
    const result = getPlayerByNumber(8, "2025-2026");
    expect(result).not.toBeNull();
    expect(result!.player.number).toBe(8);
    expect(result!.summary).not.toBeNull();
  });

  it("存在しない選手番号でnullを返す", () => {
    const result = getPlayerByNumber(99999);
    expect(result).toBeNull();
  });

  it("ロスターにだけ存在する選手も返す", () => {
    const result = getPlayerByNumber(7, "2025-2026");
    expect(result).not.toBeNull();
    expect(result!.player.name).toBe("北川 友加里");
    expect(result!.summary).toBeNull();
    expect(result!.games).toEqual([]);
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

  it("ロスターだけにいる選手の背番号も含む", () => {
    const numbers = getAllPlayerNumbers("2025-2026");
    expect(numbers).toContain(7);
  });
});

describe("getRosterPlayers", () => {
  it("ロスターCSVから選手一覧を返す", () => {
    const members = getRosterPlayers("2025-2026");
    expect(members.length).toBeGreaterThan(0);
    expect(members.find((member) => member.number === 7)?.name).toBe("北川 友加里");
    expect(members.find((member) => member.number === 3)).toBeUndefined();
    expect(members.find((member) => member.memberId === "sato")?.name).toBe("佐藤 諒成");
    expect(members.find((member) => member.memberId === "nagaya")?.name).toBe("長屋 祐助");
    expect(members.find((member) => member.memberId === "koyama")?.name).toBe("神山 健司");
  });
});

describe("getMemberList", () => {
  it("ロスター基準でサマリを left join する", () => {
    const members = getMemberList("2025-2026");
    const rosterOnly = members.find((member) => member.number === 7);
    const statPlayer = members.find((member) => member.number === 8);
    const coach = members.find((member) => member.memberId === "sato");

    expect(rosterOnly).toBeDefined();
    expect(rosterOnly!.summary).toBeNull();
    expect(statPlayer).toBeDefined();
    expect(statPlayer!.summary).not.toBeNull();
    expect(coach).toBeDefined();
    expect(coach!.summary).toBeNull();
  });
});

describe("getMemberById", () => {
  it("存在する memberId でメンバーデータを返す", () => {
    const result = getMemberById("7", "2025-2026");
    expect(result).not.toBeNull();
    expect(result!.player.memberId).toBe("7");
    expect(result!.player.number).toBe(7);
  });

  it("コーチは summary と games を持たない", () => {
    const result = getMemberById("sato", "2025-2026");
    expect(result).not.toBeNull();
    expect(result!.player.role).toBe("coach");
    expect(result!.player.name).toBe("佐藤 諒成");
    expect(result!.summary).toBeNull();
    expect(result!.games).toEqual([]);
  });
});

describe("getAllMemberIds", () => {
  it("コーチを含む memberId 配列を返す", () => {
    const ids = getAllMemberIds("2025-2026");
    expect(ids).toContain("7");
    expect(ids).toContain("sato");
    expect(ids).toContain("nagaya");
    expect(ids).toContain("koyama");
  });
});
