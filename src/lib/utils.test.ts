import { describe, it, expect } from "vitest";
import { formatPct, parsePctString, parseIntOrNull, pctColor, getPlayerColor, CHART_COLORS } from "./utils";

describe("formatPct", () => {
  it("nullの場合は'-'を返す", () => {
    expect(formatPct(null)).toBe("-");
  });

  it("数値をパーセント文字列にフォーマットする", () => {
    expect(formatPct(50)).toBe("50.0%");
    expect(formatPct(33.333)).toBe("33.3%");
    expect(formatPct(0)).toBe("0.0%");
    expect(formatPct(100)).toBe("100.0%");
  });
});

describe("parsePctString", () => {
  it("空文字列はnullを返す", () => {
    expect(parsePctString("")).toBeNull();
  });

  it("'-'はnullを返す", () => {
    expect(parsePctString("-")).toBeNull();
  });

  it("パーセント文字列を数値に変換する", () => {
    expect(parsePctString("50%")).toBe(50);
    expect(parsePctString("33.3%")).toBe(33.3);
    expect(parsePctString("100%")).toBe(100);
  });

  it("%なしの数値文字列も変換する", () => {
    expect(parsePctString("50")).toBe(50);
  });

  it("無効な文字列はnullを返す", () => {
    expect(parsePctString("abc")).toBeNull();
  });
});

describe("parseIntOrNull", () => {
  it("空文字列はnullを返す", () => {
    expect(parseIntOrNull("")).toBeNull();
  });

  it("'-'はnullを返す", () => {
    expect(parseIntOrNull("-")).toBeNull();
  });

  it("数値文字列を整数に変換する", () => {
    expect(parseIntOrNull("10")).toBe(10);
    expect(parseIntOrNull("0")).toBe(0);
  });

  it("無効な文字列はnullを返す", () => {
    expect(parseIntOrNull("abc")).toBeNull();
  });
});

describe("pctColor", () => {
  it("nullの場合はグレーを返す", () => {
    expect(pctColor(null)).toBe("#6b7280");
  });

  it("50以上は緑を返す", () => {
    expect(pctColor(50)).toBe("#34D399");
    expect(pctColor(100)).toBe("#34D399");
  });

  it("33-49は黄色を返す", () => {
    expect(pctColor(33)).toBe("#FBBF24");
    expect(pctColor(49)).toBe("#FBBF24");
  });

  it("33未満は赤を返す", () => {
    expect(pctColor(32)).toBe("#F87171");
    expect(pctColor(0)).toBe("#F87171");
  });
});

describe("getPlayerColor", () => {
  it("インデックスに対応する色を返す", () => {
    expect(getPlayerColor(0)).toBe(CHART_COLORS[0]);
    expect(getPlayerColor(1)).toBe(CHART_COLORS[1]);
  });

  it("インデックスが配列長を超えたらラップする", () => {
    expect(getPlayerColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
  });
});
