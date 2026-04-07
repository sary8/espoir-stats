"use client";

import { useMemo } from "react";
import { Crown, CircleDot, MoveUp, MoveDown, Grab, Handshake, Scissors, Ban, RotateCcw, AlertTriangle, Zap, TrendingUp } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { PlayerSummary } from "@/lib/types";
import { calcEff } from "@/lib/stats";

function calcAvgEff(p: PlayerSummary): number {
  const eff = calcEff({
    points: p.totalPoints, totalReb: p.totalReb, assists: p.assists, steals: p.steals, blocks: p.blocks,
    threePointMade: p.threePointMade, threePointAttempt: p.threePointAttempt,
    twoPointMade: p.twoPointMade, twoPointAttempt: p.twoPointAttempt,
    ftMade: p.ftMade, ftAttempt: p.ftAttempt, turnovers: p.turnovers,
  });
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
  { label: "得点", key: "totalPoints", icon: <Crown size={16} aria-hidden="true" /> },
  { label: "平均EFF", key: null, computeValue: calcAvgEff, format: (v) => v.toFixed(1), icon: <TrendingUp size={16} aria-hidden="true" /> },
  { label: "3PM", key: "threePointMade", icon: <CircleDot size={16} aria-hidden="true" /> },
  { label: "オフェンスリバウンド", key: "offReb", icon: <MoveUp size={16} aria-hidden="true" /> },
  { label: "ディフェンスリバウンド", key: "defReb", icon: <MoveDown size={16} aria-hidden="true" /> },
  { label: "合計リバウンド", key: "totalReb", icon: <Grab size={16} aria-hidden="true" /> },
  { label: "アシスト", key: "assists", icon: <Handshake size={16} aria-hidden="true" /> },
  { label: "スティール", key: "steals", icon: <Scissors size={16} aria-hidden="true" /> },
  { label: "ブロック", key: "blocks", icon: <Ban size={16} aria-hidden="true" /> },
  { label: "ターンオーバー", key: "turnovers", icon: <RotateCcw size={16} aria-hidden="true" /> },
  { label: "ファール", key: "personalFouls", icon: <AlertTriangle size={16} aria-hidden="true" /> },
  { label: "ファールドローン", key: "foulsDrawn", icon: <Zap size={16} aria-hidden="true" /> },
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
      const values = sorted.map((p) => getValue(cat, p));
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      return { ...cat, sorted, maxVal, minVal };
    }),
    [players]
  );

  return (
    <AnimatedSection id="ranking" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center uppercase tracking-wider">
        Stats <span className="text-accent-purple">Ranking</span>
      </h2>
      <div className="court-divider mb-6 sm:mb-8" aria-hidden="true" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {rankedCategories.map((cat, ci) => {
          const { sorted, maxVal, minVal } = cat;
          const range = maxVal - Math.min(minVal, 0);

          return (
            <AnimatedSection key={cat.label} delay={ci * 0.04}>
              <GlassCard className="h-full" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 280px" }}>
                <div className="flex items-center gap-2 mb-3 text-accent-purple">
                  {cat.icon}
                  <span className="font-[family-name:var(--font-barlow-condensed)] font-bold text-sm uppercase tracking-wider">{cat.label}</span>
                </div>
                <ol className="space-y-1.5">
                  {sorted.map((p, rank) => {
                    const val = getValue(cat, p);
                    const pct = range > 0 ? (Math.max(val, 0) / range) * 100 : 0;
                    const isFirst = rank === 0;
                    return (
                      <li key={p.number} className="flex items-center gap-2 text-sm">
                        <span className={`w-5 text-right text-xs stat-number ${isFirst ? "text-accent-gold font-bold" : "text-neutral-600"}`}>
                          {rank + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className={`truncate ${isFirst ? "text-accent-gold font-semibold" : ""}`}>
                              {p.name}
                            </span>
                            <span className={`stat-number ml-2 shrink-0 ${isFirst ? "text-accent-gold" : ""}`}>
                              {cat.format ? cat.format(val) : val}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full transition-all ${isFirst ? "bg-accent-gold" : "bg-accent-purple/40"}`}
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
