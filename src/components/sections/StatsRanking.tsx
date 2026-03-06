"use client";

import { useMemo } from "react";
import { Crown, CircleDot, MoveUp, MoveDown, Grab, Handshake, Scissors, Ban, RotateCcw, AlertTriangle, Zap, TrendingUp } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { PlayerSummary } from "@/lib/types";

function calcAvgEff(p: PlayerSummary): number {
  const fgMissed = (p.threePointAttempt + p.twoPointAttempt) - (p.threePointMade + p.twoPointMade);
  const ftMissed = p.ftAttempt - p.ftMade;
  const eff = p.totalPoints + p.totalReb + p.assists + p.steals + p.blocks - fgMissed - ftMissed - p.turnovers;
  return p.games > 0 ? eff / p.games : 0;
}

interface Category {
  label: string;
  key: keyof PlayerSummary | null;
  computeValue?: (p: PlayerSummary) => number;
  format?: (v: number) => string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { label: "得点", key: "totalPoints", icon: <Crown size={18} aria-hidden="true" /> },
  { label: "平均EFF", key: null, computeValue: calcAvgEff, format: (v) => v.toFixed(1), icon: <TrendingUp size={18} aria-hidden="true" /> },
  { label: "3PM", key: "threePointMade", icon: <CircleDot size={18} aria-hidden="true" /> },
  { label: "オフェンスリバウンド", key: "offReb", icon: <MoveUp size={18} aria-hidden="true" /> },
  { label: "ディフェンスリバウンド", key: "defReb", icon: <MoveDown size={18} aria-hidden="true" /> },
  { label: "合計リバウンド", key: "totalReb", icon: <Grab size={18} aria-hidden="true" /> },
  { label: "アシスト", key: "assists", icon: <Handshake size={18} aria-hidden="true" /> },
  { label: "スティール", key: "steals", icon: <Scissors size={18} aria-hidden="true" /> },
  { label: "ブロック", key: "blocks", icon: <Ban size={18} aria-hidden="true" /> },
  { label: "ターンオーバー", key: "turnovers", icon: <RotateCcw size={18} aria-hidden="true" /> },
  { label: "ファール", key: "personalFouls", icon: <AlertTriangle size={18} aria-hidden="true" /> },
  { label: "ファールドローン", key: "foulsDrawn", icon: <Zap size={18} aria-hidden="true" /> },
];

interface StatsRankingProps {
  players: PlayerSummary[];
}

export default function StatsRanking({ players }: StatsRankingProps) {
  const getValue = (cat: Category, p: PlayerSummary): number =>
    cat.computeValue ? cat.computeValue(p) : (p[cat.key!] as number);

  const rankedCategories = useMemo(
    () => categories.map((cat) => {
      const sorted = [...players].sort((a, b) => getValue(cat, b) - getValue(cat, a));
      return { ...cat, sorted, maxVal: getValue(cat, sorted[0]) };
    }),
    [players]
  );

  return (
    <AnimatedSection id="ranking" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
        Stats <span className="text-accent-purple">Ranking</span>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
        {rankedCategories.map((cat, ci) => {
          const { sorted, maxVal } = cat;

          return (
            <AnimatedSection key={cat.label} delay={ci * 0.05}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-2 mb-3 text-accent-purple">
                  {cat.icon}
                  <span className="font-semibold text-sm">{cat.label}</span>
                </div>
                <ol className="space-y-1.5">
                  {sorted.map((p, rank) => {
                    const val = getValue(cat, p);
                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    const isFirst = rank === 0;
                    return (
                      <li key={p.number} className="flex items-center gap-2 text-sm">
                        <span className={`w-5 text-right text-xs font-mono ${isFirst ? "text-amber-700 font-bold" : "text-neutral-500"}`}>
                          {rank + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className={`truncate ${isFirst ? "text-amber-700 font-semibold" : ""}`}>
                              {p.name}
                            </span>
                            <span className={`font-bold ml-2 shrink-0 ${isFirst ? "text-amber-700" : ""}`}>
                              {cat.format ? cat.format(val) : val}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full ${isFirst ? "bg-amber-700" : "bg-accent-purple/60"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </GlassCard>
            </AnimatedSection>
          );
        })}
      </div>
    </AnimatedSection>
  );
}
