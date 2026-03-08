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
  color: string;
}

const STAT_DEFS: StatDef[] = [
  { label: "合計得点", key: "totalPoints", icon: <Trophy size={20} aria-hidden="true" />, color: "text-accent-purple" },
  { label: "平均得点", key: "avgPoints", decimals: 1, icon: <Target size={20} aria-hidden="true" />, color: "text-accent-purple-light" },
  { label: "チーム3P%", key: "team3pPct", decimals: 1, suffix: "%", icon: <Percent size={20} aria-hidden="true" />, color: "text-neutral-300" },
  { label: "リバウンド", key: "totalRebounds", icon: <ArrowDownUp size={20} aria-hidden="true" />, color: "text-neutral-300" },
  { label: "アシスト", key: "totalAssists", icon: <HandHelping size={20} aria-hidden="true" />, color: "text-neutral-300" },
  { label: "スティール", key: "totalSteals", icon: <ShieldAlert size={20} aria-hidden="true" />, color: "text-neutral-300" },
  { label: "ブロック", key: "totalBlocks", icon: <Shield size={20} aria-hidden="true" />, color: "text-neutral-300" },
  { label: "ターンオーバー", key: "totalTurnovers", icon: <AlertTriangle size={20} aria-hidden="true" />, color: "text-neutral-300" },
];

const ADVANCED_DEFS: Omit<StatDef, "color">[] = [
  { label: "PACE", key: "pace", decimals: 1, icon: <Gauge size={20} aria-hidden="true" /> },
  { label: "OFFRTG", key: "offRtg", decimals: 1, icon: <Swords size={20} aria-hidden="true" /> },
  { label: "DEFRTG", key: "defRtg", decimals: 1, icon: <ShieldCheck size={20} aria-hidden="true" /> },
  { label: "NETRTG", key: "netRtg", decimals: 1, icon: <TrendingUp size={20} aria-hidden="true" /> },
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
        Team <span className="text-accent-purple">Overview</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
        {STAT_DEFS.map((stat, i) => (
          <AnimatedSection key={stat.label} delay={i * 0.1}>
            <GlassCard className="text-center">
              <div className={`mb-1 sm:mb-2 flex justify-center ${stat.color}`}>{stat.icon}</div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold">
                <StatCounter end={values[stat.key]} decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ""} />
              </div>
              <div className="text-xs text-neutral-300 mt-1">{stat.label}</div>
            </GlassCard>
          </AnimatedSection>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4">
        {ADVANCED_DEFS.map((stat, i) => {
          const color = ADVANCED_COLORS[stat.key] ?? (values[stat.key] >= 0 ? "text-green-400" : "text-red-400");
          return (
            <AnimatedSection key={stat.label} delay={(STAT_DEFS.length + i) * 0.1}>
              <GlassCard className="text-center">
                <div className={`mb-1 sm:mb-2 flex justify-center ${color}`}>{stat.icon}</div>
                <div className="text-lg sm:text-2xl md:text-3xl font-bold">
                  <StatCounter end={values[stat.key]} decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ""} />
                </div>
                <div className="text-xs text-neutral-300 mt-1">{stat.label}</div>
              </GlassCard>
            </AnimatedSection>
          );
        })}
      </div>
    </AnimatedSection>
  );
}
