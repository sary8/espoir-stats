"use client";

import dynamic from "next/dynamic";
import type { GamePlayerStat } from "@/lib/types";

function ChartSkeleton() {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16"><div className="h-[320px] rounded-2xl bg-white/5 animate-pulse" /></div>;
}

const ScoringLeaders = dynamic(() => import("./ScoringLeaders"), { ssr: false, loading: () => <ChartSkeleton /> });
const ShootingChart = dynamic(() => import("./ShootingChart"), { ssr: false, loading: () => <ChartSkeleton /> });
const PlayerRadar = dynamic(() => import("./PlayerRadar"), { ssr: false, loading: () => <ChartSkeleton /> });
const GameBreakdown = dynamic(() => import("./GameBreakdown"), { ssr: false, loading: () => <ChartSkeleton /> });

export interface GameSummary {
  opponent: string;
  date: string;
  players: GamePlayerStat[];
  teamPoints: number;
  youtubeUrl: string | null;
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
