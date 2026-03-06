"use client";

import dynamic from "next/dynamic";
import type { GamePlayerStat } from "@/lib/types";

const ScoringLeaders = dynamic(() => import("./ScoringLeaders"), { ssr: false });
const ShootingChart = dynamic(() => import("./ShootingChart"), { ssr: false });
const PlayerRadar = dynamic(() => import("./PlayerRadar"), { ssr: false });
const GameBreakdown = dynamic(() => import("./GameBreakdown"), { ssr: false });

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
