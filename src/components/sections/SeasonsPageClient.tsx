"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import type { SeasonInfo, TeamSeasonStats, CrossSeasonMember, PlayerSeasonStats } from "@/lib/types";
import { calcGrowthRate } from "@/lib/stats";

const LazyBarChart = dynamic(() => import("./SeasonsBarChart"), { ssr: false });

type ViewMode = "average" | "total";

interface SeasonsPageClientProps {
  seasons: SeasonInfo[];
  teamStats: TeamSeasonStats[];
  playerStats: CrossSeasonMember[];
}

function fmt(v: number, decimals = 1): string {
  return v.toFixed(decimals);
}

function fmtPct(v: number | null): string {
  if (v === null) return "-";
  return `${v.toFixed(1)}%`;
}

function fmtInt(v: number): string {
  return String(Math.round(v));
}

interface Row {
  label: string;
  values: (string | number)[];
  higherIsBetter: boolean;
}

function getTeamRows(stats: TeamSeasonStats[], mode: ViewMode): Row[] {
  const isAvg = mode === "average";
  return [
    { label: "戦績", values: stats.map((s) => `${s.wins}W - ${s.losses}L`), higherIsBetter: true },
    { label: isAvg ? "平均得点" : "合計得点", values: stats.map((s) => isAvg ? fmt(s.avgPoints) : fmtInt(s.totalPoints)), higherIsBetter: true },
    { label: "3P%", values: stats.map((s) => fmtPct(s.threePointPct)), higherIsBetter: true },
    { label: isAvg ? "リバウンド" : "合計リバウンド", values: stats.map((s) => isAvg ? fmt(s.rebounds) : fmtInt(s.totalRebounds)), higherIsBetter: true },
    { label: isAvg ? "アシスト" : "合計アシスト", values: stats.map((s) => isAvg ? fmt(s.assists) : fmtInt(s.totalAssists)), higherIsBetter: true },
    { label: isAvg ? "スティール" : "合計スティール", values: stats.map((s) => isAvg ? fmt(s.steals) : fmtInt(s.totalSteals)), higherIsBetter: true },
    { label: isAvg ? "ブロック" : "合計ブロック", values: stats.map((s) => isAvg ? fmt(s.blocks) : fmtInt(s.totalBlocks)), higherIsBetter: true },
    { label: isAvg ? "ターンオーバー" : "合計ターンオーバー", values: stats.map((s) => isAvg ? fmt(s.turnovers) : fmtInt(s.totalTurnovers)), higherIsBetter: false },
    { label: "PACE", values: stats.map((s) => fmt(s.pace)), higherIsBetter: true },
    { label: "OFFRTG", values: stats.map((s) => fmt(s.offRtg)), higherIsBetter: true },
    { label: "DEFRTG", values: stats.map((s) => fmt(s.defRtg)), higherIsBetter: false },
    { label: "NETRTG", values: stats.map((s) => fmt(s.netRtg)), higherIsBetter: true },
  ];
}

function getBestIndex(values: (string | number)[], higherIsBetter: boolean): number | null {
  const nums = values.map((v) => {
    if (typeof v === "number") return v;
    // "2W - 4L" 形式の戦績は勝率で比較
    const wl = v.match(/^(\d+)W\s*-\s*(\d+)L$/);
    if (wl) {
      const w = parseInt(wl[1], 10);
      const total = w + parseInt(wl[2], 10);
      return total > 0 ? w / total : 0;
    }
    const parsed = parseFloat(v);
    return isNaN(parsed) ? null : parsed;
  });
  const validNums = nums.filter((n): n is number => n !== null);
  if (validNums.length < 2) return null;
  const best = higherIsBetter ? Math.max(...validNums) : Math.min(...validNums);
  return nums.indexOf(best);
}

function ModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-sm">
      <button
        type="button"
        onClick={() => onChange("average")}
        className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${mode === "average" ? "bg-accent-purple text-white font-medium" : "text-neutral-400 hover:text-white"}`}
      >
        Average
      </button>
      <button
        type="button"
        onClick={() => onChange("total")}
        className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${mode === "total" ? "bg-accent-purple text-white font-medium" : "text-neutral-400 hover:text-white"}`}
      >
        Total
      </button>
    </div>
  );
}

function CompareTable({ rows, columnHeaders, columnKeys }: { rows: Row[]; columnHeaders: { key: string; label: string }[]; columnKeys: string[] }) {
  const th = "text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap";
  const td = "text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap tabular-nums";

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-white/10 text-neutral-400">
            <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap" scope="col">指標</th>
            {columnHeaders.map((h) => (
              <th key={h.key} className={th} scope="col">{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const bestIdx = getBestIndex(row.values, row.higherIsBetter);
            return (
              <tr key={row.label} className="border-b border-white/5">
                <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={columnKeys[i]} className={`${td} ${bestIdx === i ? "text-accent-purple font-bold" : ""}`}>
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface GrowthIndicator {
  label: string;
  prev: number;
  current: number;
  diff: number;
  rate: number | null;
  higherIsBetter: boolean;
}

function getPlayerGrowth(prev: PlayerSeasonStats, current: PlayerSeasonStats): GrowthIndicator[] {
  const indicators: { label: string; getPrev: number; getCurrent: number; higherIsBetter: boolean }[] = [
    { label: "PPG", getPrev: prev.ppg, getCurrent: current.ppg, higherIsBetter: true },
    { label: "RPG", getPrev: prev.rpg, getCurrent: current.rpg, higherIsBetter: true },
    { label: "APG", getPrev: prev.apg, getCurrent: current.apg, higherIsBetter: true },
    { label: "3P%", getPrev: prev.threePointPct ?? 0, getCurrent: current.threePointPct ?? 0, higherIsBetter: true },
    { label: "EFF", getPrev: prev.avgEff, getCurrent: current.avgEff, higherIsBetter: true },
  ];

  return indicators.map((ind) => ({
    label: ind.label,
    prev: ind.getPrev,
    current: ind.getCurrent,
    diff: ind.getCurrent - ind.getPrev,
    rate: calcGrowthRate(ind.getPrev, ind.getCurrent),
    higherIsBetter: ind.higherIsBetter,
  }));
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

export default function SeasonsPageClient({ seasons, teamStats, playerStats }: SeasonsPageClientProps) {
  const sortedMembers = useMemo(() => {
    return playerStats
      .filter((m) => m.role === "player" && m.seasons.length >= 2)
      .sort((a, b) => {
        const aNum = a.number ?? 999;
        const bNum = b.number ?? 999;
        return aNum - bNum;
      });
  }, [playerStats]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => sortedMembers[0]?.memberId ?? "");
  const [teamMode, setTeamMode] = useState<ViewMode>("average");

  const selectedMember = useMemo(() => sortedMembers.find((m) => m.memberId === selectedMemberId) ?? null, [sortedMembers, selectedMemberId]);

  const seasonIds = teamStats.map((s) => s.seasonId);
  const seasonHeaders = teamStats.map((s) => ({ key: s.seasonId, label: s.label }));

  const teamRows = useMemo(() => getTeamRows(teamStats, teamMode), [teamStats, teamMode]);

  const barChartData = useMemo(() => {
    return teamStats.map((s) => ({
      season: s.label,
      avgPoints: Math.round(s.avgPoints * 10) / 10,
      rebounds: Math.round(s.rebounds * 10) / 10,
      assists: Math.round(s.assists * 10) / 10,
    }));
  }, [teamStats]);

  const growthData = useMemo(() => {
    if (!selectedMember || selectedMember.seasons.length < 2) return null;
    const sorted = [...selectedMember.seasons].sort((a, b) => a.seasonId.localeCompare(b.seasonId));
    const prev = sorted[sorted.length - 2];
    const current = sorted[sorted.length - 1];
    return {
      prevLabel: prev.label,
      currentLabel: current.label,
      indicators: getPlayerGrowth(prev, current),
    };
  }, [selectedMember]);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#0a0a0f]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Season <span className="text-accent-purple">Growth</span>
            </h1>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">シーズン横断でチーム・個人の成長を可視化</p>
          </div>
        </section>

        {/* Team Comparison */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
            Team <span className="text-accent-purple">Comparison</span>
          </h2>
          <div className="flex justify-center mb-4">
            <ModeToggle mode={teamMode} onChange={setTeamMode} />
          </div>
          <GlassCard>
            <CompareTable rows={teamRows} columnHeaders={seasonHeaders} columnKeys={seasonIds} />
          </GlassCard>
        </AnimatedSection>

        {/* Team Bar Chart */}
        {barChartData.length > 1 ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
              Team <span className="text-accent-purple">Trends</span>
            </h2>
            <GlassCard>
              <LazyBarChart data={barChartData} />
            </GlassCard>
          </AnimatedSection>
        ) : null}

        {/* Player Growth */}
        {sortedMembers.length > 0 ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
              Player <span className="text-accent-purple">Growth</span>
            </h2>
            <div className="mb-6 flex justify-center">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-purple cursor-pointer min-w-[200px]"
                aria-label="選手を選択"
              >
                {sortedMembers.map((m) => (
                  <option key={m.memberId} value={m.memberId} className="bg-[#1a1a2e]">
                    {m.number !== null ? `#${m.number} ` : ""}{m.name}
                  </option>
                ))}
              </select>
            </div>
            {growthData ? (
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
            ) : (
              <GlassCard className="text-center text-neutral-400 text-sm">
                複数シーズン参加した選手を選択してください
              </GlassCard>
            )}
          </AnimatedSection>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
