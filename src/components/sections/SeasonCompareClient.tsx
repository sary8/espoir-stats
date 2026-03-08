"use client";

import { useState, useMemo } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import type { SeasonInfo, TeamSeasonStats, CrossSeasonMember } from "@/lib/types";

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

interface TeamRow {
  label: string;
  values: (string | number)[];
  higherIsBetter: boolean;
}

function getTeamRows(stats: TeamSeasonStats[]): TeamRow[] {
  return [
    { label: "戦績", values: stats.map((s) => `${s.wins}W - ${s.losses}L`), higherIsBetter: true },
    { label: "平均得点", values: stats.map((s) => fmt(s.avgPoints)), higherIsBetter: true },
    { label: "3P%", values: stats.map((s) => fmtPct(s.threePointPct)), higherIsBetter: true },
    { label: "リバウンド", values: stats.map((s) => fmt(s.rebounds)), higherIsBetter: true },
    { label: "アシスト", values: stats.map((s) => fmt(s.assists)), higherIsBetter: true },
    { label: "スティール", values: stats.map((s) => fmt(s.steals)), higherIsBetter: true },
    { label: "ブロック", values: stats.map((s) => fmt(s.blocks)), higherIsBetter: true },
    { label: "ターンオーバー", values: stats.map((s) => fmt(s.turnovers)), higherIsBetter: false },
    { label: "PACE", values: stats.map((s) => fmt(s.pace)), higherIsBetter: true },
    { label: "OFFRTG", values: stats.map((s) => fmt(s.offRtg)), higherIsBetter: true },
    { label: "DEFRTG", values: stats.map((s) => fmt(s.defRtg)), higherIsBetter: false },
    { label: "NETRTG", values: stats.map((s) => fmt(s.netRtg)), higherIsBetter: true },
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

export default function SeasonCompareClient({ seasons, teamStats, playerStats }: SeasonCompareClientProps) {
  const sortedMembers = useMemo(() => {
    return playerStats.filter((m) => m.role === "player").sort((a, b) => {
      const aNum = a.number ?? 999;
      const bNum = b.number ?? 999;
      return aNum - bNum;
    });
  }, [playerStats]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => sortedMembers[0]?.memberId ?? "");

  const selectedMember = useMemo(() => sortedMembers.find((m) => m.memberId === selectedMemberId) ?? null, [sortedMembers, selectedMemberId]);

  const seasonIds = teamStats.map((s) => s.seasonId);

  const teamRows = useMemo(() => getTeamRows(teamStats), [teamStats]);

  const th = "text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap";
  const td = "text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap tabular-nums";

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
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm" aria-label="チームシーズン比較">
                <caption className="sr-only">シーズン別チームスタッツ比較</caption>
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap" scope="col">指標</th>
                    {teamStats.map((s) => (
                      <th key={s.seasonId} className={th} scope="col">{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamRows.map((row) => {
                    const bestIdx = getBestIndex(row.values, row.higherIsBetter);
                    return (
                      <tr key={row.label} className="border-b border-white/5">
                        <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">{row.label}</td>
                        {row.values.map((v, i) => (
                          <td key={teamStats[i].seasonId} className={`${td} ${bestIdx === i ? "text-accent-purple font-bold" : ""}`}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Player Comparison */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
            Individual <span className="text-accent-purple">Comparison</span>
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
          {selectedMember ? (
            <GlassCard>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-xs sm:text-sm" aria-label={`${selectedMember.name} シーズン比較`}>
                  <caption className="sr-only">{selectedMember.name}のシーズン別スタッツ比較</caption>
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400">
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap" scope="col">指標</th>
                      {seasonIds.map((sid) => {
                        const s = teamStats.find((t) => t.seasonId === sid);
                        return <th key={sid} className={th} scope="col">{s?.label ?? sid}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {renderPlayerRows(selectedMember, seasonIds)}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : null}
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}

function renderPlayerRows(member: CrossSeasonMember, seasonIds: string[]) {
  const td = "text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap tabular-nums";

  const seasonMap = new Map(member.seasons.map((s) => [s.seasonId, s]));

  function getCellValue(seasonId: string, getValue: (s: typeof member.seasons[0]) => string): string {
    const s = seasonMap.get(seasonId);
    if (!s) return "-";
    if (s.games === 0) return "DNP";
    return getValue(s);
  }

  const rows: { label: string; values: string[]; higherIsBetter: boolean }[] = [
    { label: "GP", values: seasonIds.map((sid) => { const s = seasonMap.get(sid); if (!s) return "-"; return String(s.games); }), higherIsBetter: true },
    { label: "Total PTS", values: seasonIds.map((sid) => getCellValue(sid, (s) => String(s.totalPoints))), higherIsBetter: true },
    { label: "PPG", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmt(s.ppg))), higherIsBetter: true },
    { label: "RPG", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmt(s.rpg))), higherIsBetter: true },
    { label: "APG", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmt(s.apg))), higherIsBetter: true },
    { label: "SPG", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmt(s.spg))), higherIsBetter: true },
    { label: "BPG", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmt(s.bpg))), higherIsBetter: true },
    { label: "3P%", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmtPct(s.threePointPct))), higherIsBetter: true },
    { label: "2P%", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmtPct(s.twoPointPct))), higherIsBetter: true },
    { label: "FT%", values: seasonIds.map((sid) => getCellValue(sid, (s) => fmtPct(s.ftPct))), higherIsBetter: true },
    { label: "EFF", values: seasonIds.map((sid) => getCellValue(sid, (s) => String(s.eff))), higherIsBetter: true },
  ];

  return rows.map((row) => {
    const bestIdx = getBestIndex(row.values, row.higherIsBetter);
    return (
      <tr key={row.label} className="border-b border-white/5">
        <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">{row.label}</td>
        {row.values.map((v, i) => (
          <td key={seasonIds[i]} className={`${td} ${bestIdx === i ? "text-accent-purple font-bold" : ""}`}>
            {v}
          </td>
        ))}
      </tr>
    );
  });
}

