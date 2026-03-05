"use client";

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
}

export default function PlayerCards({ players, topScorer, topRebounder, topAssister }: PlayerCardsProps) {
  const sorted = [...players].sort((a, b) => a.number - b.number);

  return (
    <AnimatedSection id="players" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Player <span className="text-accent-purple">Roster</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((p, i) => (
          <AnimatedSection key={p.number} delay={i * 0.05}>
            <Link href={`/player/${p.number}`}>
              <GlassCard hover className="cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold text-accent-purple/80">#{p.number}</div>
                    <div className="text-lg font-semibold mt-1">{p.name}</div>
                    <div className="text-xs text-neutral-400">{p.games} games played</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {p.number === topScorer && <Badge variant="purple">Top Scorer</Badge>}
                    {p.number === topRebounder && <Badge variant="blue">Top Rebounder</Badge>}
                    {p.number === topAssister && <Badge variant="green">Top Assists</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <div className="text-xl font-bold">{p.ppg}</div>
                    <div className="text-xs text-neutral-400">PPG</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{(p.totalReb / p.games).toFixed(1)}</div>
                    <div className="text-xs text-neutral-400">RPG</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{(p.assists / p.games).toFixed(1)}</div>
                    <div className="text-xs text-neutral-400">APG</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 sm:gap-6">
                  <ProgressRing percentage={p.threePointPct} size={50} strokeWidth={4} color={shootingColors.threePoint} label="3P%" />
                  <ProgressRing percentage={p.twoPointPct} size={50} strokeWidth={4} color={shootingColors.twoPoint} label="2P%" />
                  <ProgressRing percentage={p.ftPct} size={50} strokeWidth={4} color={shootingColors.freeThrow} label="FT%" />
                </div>
              </GlassCard>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  );
}
