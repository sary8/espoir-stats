export interface EffInput {
  points: number;
  totalReb: number;
  assists: number;
  steals: number;
  blocks: number;
  threePointMade: number;
  threePointAttempt: number;
  twoPointMade: number;
  twoPointAttempt: number;
  ftMade: number;
  ftAttempt: number;
  turnovers: number;
}

export function calcEff(s: EffInput): number {
  const fgm = s.threePointMade + s.twoPointMade;
  const fga = s.threePointAttempt + s.twoPointAttempt;
  return (s.points + s.totalReb + s.assists + s.steals + s.blocks) - ((fga - fgm) + (s.ftAttempt - s.ftMade) + s.turnovers);
}

export function parseMinutesToSeconds(min: string): number {
  if (!min) return 0;
  const parts = min.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}

export interface TeamTotals {
  threePointMade: number;
  threePointAttempt: number;
  twoPointMade: number;
  twoPointAttempt: number;
  ftAttempt: number;
  offReb: number;
  defReb: number;
  turnovers: number;
  points: number;
  totalMinutes: number;
}

export function calcTeamPossEst(
  team: Pick<TeamTotals, "threePointMade" | "threePointAttempt" | "twoPointMade" | "twoPointAttempt" | "ftAttempt" | "offReb" | "turnovers">,
  oppDefReb: number,
): number {
  const fga = team.twoPointAttempt + team.threePointAttempt;
  const fgm = team.twoPointMade + team.threePointMade;
  const orebFactor = team.offReb + oppDefReb > 0 ? team.offReb / (team.offReb + oppDefReb) : 0;
  return fga + 0.4 * team.ftAttempt - 1.07 * orebFactor * (fga - fgm) + team.turnovers;
}

export interface GrowthEntry {
  label: string;
  prev: number;
  current: number;
  diff: number;
  growthRate: number | null;
}

export function calcGrowthRate(prev: number, current: number): number | null {
  if (prev === 0) return current > 0 ? null : null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

export function calcAdvancedStats(espoir: TeamTotals, opponent: TeamTotals) {
  const ePossEst = calcTeamPossEst(espoir, opponent.defReb);
  const oPossEst = calcTeamPossEst(opponent, espoir.defReb);
  const poss = 0.5 * (ePossEst + oPossEst);
  const eMinDec = espoir.totalMinutes / 60;
  const pace = eMinDec > 0 ? 40 * (ePossEst + oPossEst) / (2 * (eMinDec / 5)) : 0;
  const offRtg = poss > 0 ? 100 * espoir.points / poss : 0;
  const defRtg = poss > 0 ? 100 * opponent.points / poss : 0;
  const netRtg = offRtg - defRtg;
  return { poss: Math.round(poss), pace, offRtg, defRtg, netRtg };
}
