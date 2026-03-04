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
  if (pct >= 50) return "#22c55e";
  if (pct >= 33) return "#f97316";
  return "#ef4444";
}

export const CHART_COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#a855f7",
  "#ef4444", "#06b6d4", "#eab308", "#ec4899", "#14b8a6",
];

export function getPlayerColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
