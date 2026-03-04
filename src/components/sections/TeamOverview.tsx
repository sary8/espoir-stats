"use client";

import { Trophy, Target, Percent, ArrowDownUp, HandHelping, ShieldAlert } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import StatCounter from "../ui/StatCounter";

interface Stat {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

interface TeamOverviewProps {
  totalPoints: number;
  avgPoints: number;
  team3pPct: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
}

export default function TeamOverview(props: TeamOverviewProps) {
  const stats: Stat[] = [
    { label: "合計得点", value: props.totalPoints, icon: <Trophy size={20} />, color: "text-orange-400" },
    { label: "平均得点", value: props.avgPoints, decimals: 1, icon: <Target size={20} />, color: "text-blue-400" },
    { label: "チーム3P%", value: props.team3pPct, decimals: 1, suffix: "%", icon: <Percent size={20} />, color: "text-green-400" },
    { label: "リバウンド", value: props.totalRebounds, icon: <ArrowDownUp size={20} />, color: "text-purple-400" },
    { label: "アシスト", value: props.totalAssists, icon: <HandHelping size={20} />, color: "text-cyan-400" },
    { label: "スティール", value: props.totalSteals, icon: <ShieldAlert size={20} />, color: "text-yellow-400" },
  ];

  return (
    <AnimatedSection id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Team <span className="text-accent-orange">Overview</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        {stats.map((stat, i) => (
          <AnimatedSection key={stat.label} delay={i * 0.1}>
            <GlassCard className="text-center">
              <div className={`mb-1 sm:mb-2 flex justify-center ${stat.color}`}>{stat.icon}</div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold">
                <StatCounter end={stat.value} decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ""} />
              </div>
              <div className="text-xs text-neutral-400 mt-1">{stat.label}</div>
            </GlassCard>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  );
}
