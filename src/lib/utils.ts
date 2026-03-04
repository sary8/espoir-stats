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
  if (pct >= 50) return "#5ea87a";
  if (pct >= 33) return "#c8845e";
  return "#c47272";
}

export const CHART_COLORS = [
  "#c8845e", "#6b8fbe", "#5ea87a", "#9b7cb8",
  "#c47272", "#5a9eaa", "#bfa254", "#b87a96", "#5aaa98",
];

export function getPlayerColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
