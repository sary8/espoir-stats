"use client";

import { Trophy, Target, Percent, ArrowDownUp, HandHelping, ShieldAlert, Shield, AlertTriangle, Gauge, Swords, ShieldCheck, TrendingUp } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import StatCounter from "../ui/StatCounter";

interface StatDef {
  label: string;
  key: string;
  decimals?: number;
  suffix?: string;
  icon: React.ReactNode;
  accent?: boolean;
}

const STAT_DEFS: StatDef[] = [
  { label: "合計得点", key: "totalPoints", icon: <Trophy size={18} aria-hidden="true" />, accent: true },
  { label: "平均得点", key: "avgPoints", decimals: 1, icon: <Target size={18} aria-hidden="true" />, accent: true },
  { label: "チーム3P%", key: "team3pPct", decimals: 1, suffix: "%", icon: <Percent size={18} aria-hidden="true" /> },
  { label: "リバウンド", key: "totalRebounds", icon: <ArrowDownUp size={18} aria-hidden="true" /> },
  { label: "アシスト", key: "totalAssists", icon: <HandHelping size={18} aria-hidden="true" /> },
  { label: "スティール", key: "totalSteals", icon: <ShieldAlert size={18} aria-hidden="true" /> },
  { label: "ブロック", key: "totalBlocks", icon: <Shield size={18} aria-hidden="true" /> },
  { label: "ターンオーバー", key: "totalTurnovers", icon: <AlertTriangle size={18} aria-hidden="true" /> },
];

const ADVANCED_DEFS: (Omit<StatDef, "accent"> & { colorKey?: string })[] = [
  { label: "PACE", key: "pace", decimals: 1, icon: <Gauge size={18} aria-hidden="true" />, colorKey: "pace" },
  { label: "OFFRTG", key: "offRtg", decimals: 1, icon: <Swords size={18} aria-hidden="true" />, colorKey: "offRtg" },
  { label: "DEFRTG", key: "defRtg", decimals: 1, icon: <ShieldCheck size={18} aria-hidden="true" />, colorKey: "defRtg" },
  { label: "NETRTG", key: "netRtg", decimals: 1, icon: <TrendingUp size={18} aria-hidden="true" />, colorKey: "netRtg" },
];

const ADVANCED_COLORS: Record<string, string> = {
  pace: "text-accent-purple",
  offRtg: "text-accent-purple-light",
  defRtg: "text-neutral-300",
};

interface TeamOverviewProps {
  totalPoints: number;
  avgPoints: number;
  team3pPct: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  pace: number;
  offRtg: number;
  defRtg: number;
  netRtg: number;
}

export default function TeamOverview(props: TeamOverviewProps) {
  const values = props as unknown as Record<string, number>;

  return (
    <AnimatedSection id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center uppercase tracking-wider">
        Team <span className="text-accent-purple">Overview</span>
      </h2>

      {/* Court-line divider */}
      <div className="court-divider mb-6 sm:mb-8" aria-hidden="true" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        {STAT_DEFS.map((stat, i) => (
          <AnimatedSection key={stat.label} delay={i * 0.08}>
            <GlassCard className="text-center">
              <div className={`mb-1.5 flex justify-center ${stat.accent ? "text-accent-purple" : "text-neutral-500"}`}>{stat.icon}</div>
              <div className={`stat-number text-xl sm:text-2xl md:text-3xl ${stat.accent ? "text-accent-purple" : "text-foreground"}`}>
                <StatCounter end={values[stat.key]} decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ""} />
              </div>
              <div className="text-[10px] text-neutral-500 mt-1 font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider">{stat.label}</div>
            </GlassCard>
          </AnimatedSection>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
        {ADVANCED_DEFS.map((stat, i) => {
          const color = (stat.colorKey && ADVANCED_COLORS[stat.colorKey]) ?? (values[stat.key] >= 0 ? "text-emerald-400" : "text-red-400");
          return (
            <AnimatedSection key={stat.label} delay={(STAT_DEFS.length + i) * 0.08}>
              <GlassCard className="text-center">
                <div className={`mb-1.5 flex justify-center ${color}`}>{stat.icon}</div>
                <div className={`stat-number text-xl sm:text-2xl md:text-3xl ${color}`}>
                  <StatCounter end={values[stat.key]} decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ""} />
                </div>
                <div className="text-[10px] text-neutral-500 mt-1 font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider">{stat.label}</div>
              </GlassCard>
            </AnimatedSection>
          );
        })}
      </div>
    </AnimatedSection>
  );
}
