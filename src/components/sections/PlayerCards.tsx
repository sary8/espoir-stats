"use client";

import { useMemo } from "react";
import Link from "next/link";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import ProgressRing from "../ui/ProgressRing";
import Badge from "../ui/Badge";
import type { PlayerSummary } from "@/lib/types";
import { shootingColors } from "@/config/theme";

interface PlayerCardsProps {
  players: PlayerSummary[];
  topScorer: number;
  topRebounder: number;
  topAssister: number;
  top3P: number;
  topStealer: number;
  topBlocker: number;
  topFoul: number;
  topTurnover: number;
}

export default function PlayerCards({ players, topScorer, topRebounder, topAssister, top3P, topStealer, topBlocker, topFoul, topTurnover }: PlayerCardsProps) {
  const sorted = useMemo(() => [...players].sort((a, b) => a.number - b.number), [players]);

  return (
    <AnimatedSection id="players" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Player <span className="text-accent-purple">Roster</span>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {sorted.map((p, i) => (
          <AnimatedSection key={p.number} delay={i * 0.05}>
            <Link href={`/player/${p.number}`} className="block h-full">
              <GlassCard hover className="cursor-pointer h-full flex flex-col">
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-accent-purple/80">#{p.number}</div>
                  <div className="text-sm sm:text-lg font-semibold mt-0.5 sm:mt-1">{p.name}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-400">{p.games} games played</div>
                  {(p.number === topScorer || p.number === topRebounder || p.number === topAssister || p.number === top3P || p.number === topStealer || p.number === topBlocker || p.number === topFoul || p.number === topTurnover) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.number === topScorer && <Badge variant="purple">Top Scorer</Badge>}
                      {p.number === topRebounder && <Badge variant="blue">Top Rebounder</Badge>}
                      {p.number === topAssister && <Badge variant="green">Top Assists</Badge>}
                      {p.number === top3P && <Badge variant="pink">Top 3P</Badge>}
                      {p.number === topStealer && <Badge variant="cyan">Top Steal</Badge>}
                      {p.number === topBlocker && <Badge variant="yellow">Top Block</Badge>}
                      {p.number === topFoul && <Badge variant="red">Top Foul</Badge>}
                      {p.number === topTurnover && <Badge variant="orange">Top Turnovers</Badge>}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-4 text-center mt-auto pt-2 sm:pt-4">
                  <div>
                    <div className="text-base sm:text-xl font-bold">{p.ppg}</div>
                    <div className="text-[10px] sm:text-xs text-neutral-400">PPG</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-bold">{(p.totalReb / p.games).toFixed(1)}</div>
                    <div className="text-[10px] sm:text-xs text-neutral-400">RPG</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-bold">{(p.assists / p.games).toFixed(1)}</div>
                    <div className="text-[10px] sm:text-xs text-neutral-400">APG</div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 sm:gap-6">
                  <ProgressRing percentage={p.threePointPct} size={40} strokeWidth={3} color={shootingColors.threePoint} label="3P%" />
                  <ProgressRing percentage={p.twoPointPct} size={40} strokeWidth={3} color={shootingColors.twoPoint} label="2P%" />
                  <ProgressRing percentage={p.ftPct} size={40} strokeWidth={3} color={shootingColors.freeThrow} label="FT%" />
                </div>
              </GlassCard>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  );
}
