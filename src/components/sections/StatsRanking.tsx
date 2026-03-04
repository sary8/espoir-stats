"use client";

import { Trophy, Crosshair, ArrowUp, ArrowDown, HandHelping, ShieldAlert, Shield, AlertTriangle, UserX, Flame } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { PlayerSummary } from "@/lib/types";

interface Category {
  label: string;
  key: keyof PlayerSummary;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { label: "得点", key: "totalPoints", icon: <Trophy size={18} /> },
  { label: "3PM", key: "threePointMade", icon: <Crosshair size={18} /> },
  { label: "オフェンスリバウンド", key: "offReb", icon: <ArrowUp size={18} /> },
  { label: "ディフェンスリバウンド", key: "defReb", icon: <ArrowDown size={18} /> },
  { label: "アシスト", key: "assists", icon: <HandHelping size={18} /> },
  { label: "スティール", key: "steals", icon: <ShieldAlert size={18} /> },
  { label: "ブロック", key: "blocks", icon: <Shield size={18} /> },
  { label: "ターンオーバー", key: "turnovers", icon: <AlertTriangle size={18} /> },
  { label: "ファール", key: "personalFouls", icon: <UserX size={18} /> },
  { label: "ファールドローン", key: "foulsDrawn", icon: <Flame size={18} /> },
];

interface StatsRankingProps {
  players: PlayerSummary[];
}

export default function StatsRanking({ players }: StatsRankingProps) {
  return (
    <AnimatedSection id="ranking" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Stats <span className="text-accent-purple">Ranking</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, ci) => {
          const sorted = [...players].sort(
            (a, b) => (b[cat.key] as number) - (a[cat.key] as number)
          );
          const maxVal = sorted[0]?.[cat.key] as number;

          return (
            <AnimatedSection key={cat.label} delay={ci * 0.05}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-2 mb-3 text-accent-purple">
                  {cat.icon}
                  <span className="font-semibold text-sm">{cat.label}</span>
                </div>
                <ol className="space-y-1.5">
                  {sorted.map((p, rank) => {
                    const val = p[cat.key] as number;
                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    const isFirst = rank === 0;
                    return (
                      <li key={p.number} className="flex items-center gap-2 text-sm">
                        <span className={`w-5 text-right text-xs font-mono ${isFirst ? "text-accent-purple font-bold" : "text-neutral-500"}`}>
                          {rank + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className={`truncate ${isFirst ? "text-accent-purple font-semibold" : ""}`}>
                              {p.name}
                            </span>
                            <span className={`font-bold ml-2 shrink-0 ${isFirst ? "text-accent-purple" : ""}`}>
                              {val}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full ${isFirst ? "bg-accent-purple" : "bg-accent-purple/60"}`}
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
