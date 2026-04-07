export function formatPct(value: number | null): string {
  if (value === null) return "-";
  return `${value.toFixed(1)}%`;
}

export function parsePctString(value: string): number | null {
  if (!value || value === "-") return null;
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? null : num;
}

export function parseIntOrNull(value: string): number | null {
  if (!value || value === "-") return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

export function pctColor(pct: number | null): string {
  if (pct === null) return "#6b7280";
  if (pct >= 50) return "#34D399";
  if (pct >= 33) return "#FBBF24";
  return "#F87171";
}

export const CHART_COLORS = [
  "#A855F7", "#FBBF24", "#22D3EE", "#FB7185",
  "#60A5FA", "#34D399", "#FB923C", "#818CF8", "#2DD4BF",
];

export function getPlayerColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** made/attempt からパーセンテージ文字列を返す (重複排除用の共通関数) */
export function fmtMadeAttemptPct(made: number, attempt: number): string {
  if (attempt === 0) return "-";
  return `${((made / attempt) * 100).toFixed(1)}%`;
}

/** 秒数を "M:SS" 形式に変換 */
export function formatMinutesFromSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** "M:SS" 形式を秒数に変換 */
export function parseMinutesToSeconds(min: string): number {
  if (!min) return 0;
  const parts = min.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}
