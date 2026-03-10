"use client";

import dynamic from "next/dynamic";
function ChartSkeleton() {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16"><div className="h-[320px] rounded-2xl bg-white/5 animate-pulse" /></div>;
}

const ScoringLeaders = dynamic(() => import("./ScoringLeaders"), { ssr: false, loading: () => <ChartSkeleton /> });
const ShootingChart = dynamic(() => import("./ShootingChart"), { ssr: false, loading: () => <ChartSkeleton /> });
const PlayerRadar = dynamic(() => import("./PlayerRadar"), { ssr: false, loading: () => <ChartSkeleton /> });
const GameBreakdown = dynamic(() => import("./GameBreakdown"), { ssr: false, loading: () => <ChartSkeleton /> });

export interface GamePlayerStatSlim {
  number: number;
  name: string;
  starter: boolean;
  points: number;
  threePointMade: number;
  threePointAttempt: number;
  twoPointMade: number;
  twoPointAttempt: number;
  ftMade: number;
  ftAttempt: number;
  offReb: number;
  defReb: number;
  totalReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personalFouls: number;
  foulsDrawn: number;
  minutes: string;
}

export interface GameSummary {
  gameId: string;
  opponent: string;
  date: string;
  players: GamePlayerStatSlim[];
}

interface LazyChartsProps {
  scoringData: { name: string; ppg: number; number: number }[];
  shootingData: { name: string; threePointPct: number; twoPointPct: number; ftPct: number }[];
  radarPlayers: { number: number; name: string; ppg: number; rpg: number; apg: number; spg: number; bpg: number }[];
  games: GameSummary[];
}

export default function LazyCharts({ scoringData, shootingData, radarPlayers, games }: LazyChartsProps) {
  return (
    <>
      <ScoringLeaders data={scoringData} />
      <ShootingChart data={shootingData} />
      <PlayerRadar players={radarPlayers} />
      <GameBreakdown games={games} />
    </>
  );
}
