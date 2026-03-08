"use client";

import { useState, useMemo } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import type { SeasonInfo, TeamSeasonStats, CrossSeasonMember } from "@/lib/types";

type ViewMode = "average" | "total";

interface SeasonCompareClientProps {
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

function getPlayerRows(member: CrossSeasonMember, seasonIds: string[], mode: ViewMode): Row[] {
  const isAvg = mode === "average";
  const seasonMap = new Map(member.seasons.map((s) => [s.seasonId, s]));

  function cell(seasonId: string, getValue: (s: typeof member.seasons[0]) => string): string {
    const s = seasonMap.get(seasonId);
    if (!s) return "-";
    if (s.games === 0) return "DNP";
    return getValue(s);
  }

  return [
    { label: "GP", values: seasonIds.map((sid) => { const s = seasonMap.get(sid); if (!s) return "-"; return String(s.games); }), higherIsBetter: true },
    { label: isAvg ? "PPG" : "Total PTS", values: seasonIds.map((sid) => cell(sid, (s) => isAvg ? fmt(s.ppg) : String(s.totalPoints))), higherIsBetter: true },
    { label: isAvg ? "RPG" : "Total REB", values: seasonIds.map((sid) => cell(sid, (s) => isAvg ? fmt(s.rpg) : String(s.totalRebounds))), higherIsBetter: true },
    { label: isAvg ? "APG" : "Total AST", values: seasonIds.map((sid) => cell(sid, (s) => isAvg ? fmt(s.apg) : String(s.totalAssists))), higherIsBetter: true },
    { label: isAvg ? "SPG" : "Total STL", values: seasonIds.map((sid) => cell(sid, (s) => isAvg ? fmt(s.spg) : String(s.totalSteals))), higherIsBetter: true },
    { label: isAvg ? "BPG" : "Total BLK", values: seasonIds.map((sid) => cell(sid, (s) => isAvg ? fmt(s.bpg) : String(s.totalBlocks))), higherIsBetter: true },
    { label: "3P%", values: seasonIds.map((sid) => cell(sid, (s) => fmtPct(s.threePointPct))), higherIsBetter: true },
    { label: "2P%", values: seasonIds.map((sid) => cell(sid, (s) => fmtPct(s.twoPointPct))), higherIsBetter: true },
    { label: "FT%", values: seasonIds.map((sid) => cell(sid, (s) => fmtPct(s.ftPct))), higherIsBetter: true },
    { label: isAvg ? "AVG EFF" : "Total EFF", values: seasonIds.map((sid) => cell(sid, (s) => isAvg ? fmt(s.avgEff) : String(s.eff))), higherIsBetter: true },
  ];
}

function getBestIndex(values: (string | number)[], higherIsBetter: boolean): number | null {
  const nums = values.map((v) => {
    if (typeof v === "number") return v;
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

export default function SeasonCompareClient({ seasons, teamStats, playerStats }: SeasonCompareClientProps) {
  const sortedMembers = useMemo(() => {
    return playerStats.filter((m) => m.role === "player").sort((a, b) => {
      const aNum = a.number ?? 999;
      const bNum = b.number ?? 999;
      return aNum - bNum;
    });
  }, [playerStats]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => sortedMembers[0]?.memberId ?? "");
  const [teamMode, setTeamMode] = useState<ViewMode>("average");
  const [playerMode, setPlayerMode] = useState<ViewMode>("average");

  const selectedMember = useMemo(() => sortedMembers.find((m) => m.memberId === selectedMemberId) ?? null, [sortedMembers, selectedMemberId]);

  const seasonIds = teamStats.map((s) => s.seasonId);
  const seasonHeaders = teamStats.map((s) => ({ key: s.seasonId, label: s.label }));

  const teamRows = useMemo(() => getTeamRows(teamStats, teamMode), [teamStats, teamMode]);
  const playerRows = useMemo(() => selectedMember ? getPlayerRows(selectedMember, seasonIds, playerMode) : [], [selectedMember, seasonIds, playerMode]);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#0a0a0f]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Season <span className="text-accent-purple">Compare</span>
            </h1>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">シーズン横断でチーム・個人のスタッツを比較</p>
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

        {/* Player Comparison */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
            Individual <span className="text-accent-purple">Comparison</span>
          </h2>
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
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
            <ModeToggle mode={playerMode} onChange={setPlayerMode} />
          </div>
          {selectedMember ? (
            <GlassCard>
              <CompareTable rows={playerRows} columnHeaders={seasonHeaders} columnKeys={seasonIds} />
            </GlassCard>
          ) : null}
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}
