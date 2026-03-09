"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedSection from "../ui/AnimatedSection";
import type { CrossSeasonMember } from "@/lib/types";
import { calcGrowthRate } from "@/lib/stats";

interface PlayerGrowthSectionProps {
  crossSeasonData: CrossSeasonMember;
}

function GrowthIcon({ diff, higherIsBetter }: { diff: number; higherIsBetter: boolean }) {
  if (Math.abs(diff) < 0.05) return <Minus size={14} className="text-neutral-500" aria-hidden="true" />;
  const isPositive = diff > 0;
  const isGood = isPositive === higherIsBetter;
  if (isPositive) {
    return <TrendingUp size={14} className={isGood ? "text-green-400" : "text-red-400"} aria-hidden="true" />;
  }
  return <TrendingDown size={14} className={isGood ? "text-green-400" : "text-red-400"} aria-hidden="true" />;
}

export default function PlayerGrowthSection({ crossSeasonData }: PlayerGrowthSectionProps) {
  const growthData = useMemo(() => {
    if (crossSeasonData.seasons.length < 2) return null;

    const sorted = [...crossSeasonData.seasons].sort((a, b) => a.seasonId.localeCompare(b.seasonId));
    const prev = sorted[sorted.length - 2];
    const current = sorted[sorted.length - 1];

    const indicators = [
      { label: "PPG", prev: prev.ppg, current: current.ppg, higherIsBetter: true },
      { label: "RPG", prev: prev.rpg, current: current.rpg, higherIsBetter: true },
      { label: "APG", prev: prev.apg, current: current.apg, higherIsBetter: true },
      { label: "3P%", prev: prev.threePointPct ?? 0, current: current.threePointPct ?? 0, higherIsBetter: true },
      { label: "EFF", prev: prev.avgEff, current: current.avgEff, higherIsBetter: true },
    ].map((ind) => ({
      ...ind,
      diff: ind.current - ind.prev,
      rate: calcGrowthRate(ind.prev, ind.current),
    }));

    return { prevLabel: prev.label, currentLabel: current.label, indicators };
  }, [crossSeasonData]);

  if (!growthData) return null;

  return (
    <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 [text-wrap:balance]">Season Growth</h2>
      <GlassCard>
        <div className="text-center text-sm text-neutral-400 mb-4">
          {growthData.prevLabel} → {growthData.currentLabel}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {growthData.indicators.map((ind) => {
            const isPositive = ind.diff > 0;
            const isGood = Math.abs(ind.diff) < 0.05 ? null : isPositive === ind.higherIsBetter;
            return (
              <div key={ind.label} className="text-center">
                <div className="text-xs text-neutral-400 mb-1">{ind.label}</div>
                <div className="text-lg font-bold tabular-nums">{ind.current.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <GrowthIcon diff={ind.diff} higherIsBetter={ind.higherIsBetter} />
                  <span className={`text-xs tabular-nums font-medium ${isGood === null ? "text-neutral-500" : isGood ? "text-green-400" : "text-red-400"}`}>
                    {ind.diff > 0 ? "+" : ""}{ind.diff.toFixed(1)}
                  </span>
                  {ind.rate !== null ? (
                    <span className={`text-xs tabular-nums ${isGood === null ? "text-neutral-500" : isGood ? "text-green-400/70" : "text-red-400/70"}`}>
                      ({ind.rate > 0 ? "+" : ""}{ind.rate.toFixed(0)}%)
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">prev: {ind.prev.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </AnimatedSection>
  );
}
