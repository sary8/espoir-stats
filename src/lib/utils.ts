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
  "#A855F7", "#60A5FA", "#34D399", "#F472B6",
  "#F87171", "#22D3EE", "#FBBF24", "#818CF8", "#2DD4BF",
];

export function getPlayerColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
