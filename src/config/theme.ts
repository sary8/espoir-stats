export const chartColors = {
  purple: "#A855F7",
  gold: "#FBBF24",
  cyan: "#22D3EE",
  rose: "#FB7185",
  blue: "#60A5FA",
  green: "#34D399",
  orange: "#FB923C",
  indigo: "#818CF8",
  teal: "#2DD4BF",
};

export const playerColors = Object.values(chartColors);

export const shootingColors = {
  threePoint: "#A855F7",
  twoPoint: "#22D3EE",
  freeThrow: "#FBBF24",
};

export const tooltipStyle = {
  background: "#0e0e18",
  border: "1px solid rgba(168, 85, 247, 0.15)",
  borderRadius: 6,
} as const;

export const tooltipLabelStyle = { color: "#f0eef5" } as const;
