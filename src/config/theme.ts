export const chartColors = {
  purple: "#A855F7",
  blue: "#60A5FA",
  green: "#34D399",
  pink: "#F472B6",
  red: "#F87171",
  cyan: "#22D3EE",
  yellow: "#FBBF24",
  indigo: "#818CF8",
  teal: "#2DD4BF",
};

export const playerColors = Object.values(chartColors);

export const shootingColors = {
  threePoint: "#A855F7",
  twoPoint: "#60A5FA",
  freeThrow: "#34D399",
};

export const tooltipStyle = {
  background: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
} as const;

export const tooltipLabelStyle = { color: "#fff" } as const;
