"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import type {
  SeasonInfo,
  CareerTotals,
  AllTimeSingleGameRecord,
  Award,
} from "@/lib/types";

type ViewMode = "average" | "total";

type LeaderCategory = "PTS" | "REB" | "AST" | "STL" | "BLK" | "TO" | "PF" | "FD" | "EFF";

type SortKey =
  | "name"
  | "seasonsPlayed"
  | "games"
  | "pts"
  | "reb"
  | "ast"
  | "stl"
  | "blk"
  | "to"
  | "pf"
  | "fd"
  | "eff";

type SortDir = "asc" | "desc";

interface AllTimePageClientProps {
  seasons: SeasonInfo[];
  careerTotals: CareerTotals[];
  singleGameRecords: AllTimeSingleGameRecord[];
  milestones: Award[];
}

function fmt(v: number, decimals = 1): string {
  return v.toFixed(decimals);
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
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

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronDown size={12} className="text-neutral-600" aria-hidden="true" />;
  return dir === "desc" ? (
    <ChevronDown size={12} className="text-accent-purple" aria-hidden="true" />
  ) : (
    <ChevronUp size={12} className="text-accent-purple" aria-hidden="true" />
  );
}

const TOTALS_COLUMNS: {
  key: SortKey;
  label: string;
  align: "left" | "center" | "right";
}[] = [
  { key: "name", label: "選手", align: "left" },
  { key: "seasonsPlayed", label: "SZN", align: "center" },
  { key: "games", label: "GP", align: "center" },
  { key: "pts", label: "PTS", align: "right" },
  { key: "reb", label: "REB", align: "right" },
  { key: "ast", label: "AST", align: "right" },
  { key: "stl", label: "STL", align: "right" },
  { key: "blk", label: "BLK", align: "right" },
  { key: "to", label: "TO", align: "right" },
  { key: "pf", label: "PF", align: "right" },
  { key: "fd", label: "FD", align: "right" },
  { key: "eff", label: "EFF", align: "right" },
];

const LEADER_TABS: { key: LeaderCategory; label: string }[] = [
  { key: "PTS", label: "PTS" },
  { key: "REB", label: "REB" },
  { key: "AST", label: "AST" },
  { key: "STL", label: "STL" },
  { key: "BLK", label: "BLK" },
  { key: "TO", label: "TO" },
  { key: "PF", label: "PF" },
  { key: "FD", label: "FD" },
  { key: "EFF", label: "EFF" },
];

function getLeaderValue(c: CareerTotals, cat: LeaderCategory): number {
  switch (cat) {
    case "PTS":
      return c.totalPoints;
    case "REB":
      return c.totalRebounds;
    case "AST":
      return c.totalAssists;
    case "STL":
      return c.totalSteals;
    case "BLK":
      return c.totalBlocks;
    case "TO":
      return c.totalTurnovers;
    case "PF":
      return c.totalPersonalFouls;
    case "FD":
      return c.totalFoulsDrawn;
    case "EFF":
      return c.totalEff;
  }
}

function getSortValue(
  c: CareerTotals,
  key: SortKey,
  mode: ViewMode,
): number | string {
  const isAvg = mode === "average";
  switch (key) {
    case "name":
      return c.name;
    case "seasonsPlayed":
      return c.seasonsPlayed;
    case "games":
      return c.games;
    case "pts":
      return isAvg ? c.ppg : c.totalPoints;
    case "reb":
      return isAvg ? c.rpg : c.totalRebounds;
    case "ast":
      return isAvg ? c.apg : c.totalAssists;
    case "stl":
      return isAvg ? c.spg : c.totalSteals;
    case "blk":
      return isAvg ? c.bpg : c.totalBlocks;
    case "to":
      return isAvg ? c.topg : c.totalTurnovers;
    case "pf":
      return isAvg ? c.pfpg : c.totalPersonalFouls;
    case "fd":
      return isAvg ? c.fdpg : c.totalFoulsDrawn;
    case "eff":
      return isAvg ? c.avgEff : c.totalEff;
  }
}

export default function AllTimePageClient({
  seasons,
  careerTotals,
  singleGameRecords,
  milestones,
}: AllTimePageClientProps) {
  const [leaderCat, setLeaderCat] = useState<LeaderCategory>("PTS");
  const [tableMode, setTableMode] = useState<ViewMode>("average");
  const [sortKey, setSortKey] = useState<SortKey>("pts");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const leaderRanking = useMemo(() => {
    return [...careerTotals]
      .sort((a, b) => getLeaderValue(b, leaderCat) - getLeaderValue(a, leaderCat))
      .slice(0, 20);
  }, [careerTotals, leaderCat]);

  const sortedTotals = useMemo(() => {
    return [...careerTotals].sort((a, b) => {
      const aVal = getSortValue(a, sortKey, tableMode);
      const bVal = getSortValue(b, sortKey, tableMode);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja");
      }
      const aNum = aVal as number;
      const bNum = bVal as number;
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [careerTotals, sortKey, sortDir, tableMode]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleSortKeyDown = (e: React.KeyboardEvent, key: SortKey) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(key);
    }
  };

  const getAriaSortValue = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  };

  const th =
    "py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap cursor-pointer hover:text-white transition-colors select-none";
  const td = "py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap tabular-nums";

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        {/* Hero */}
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#0a0a0f]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              All-Time <span className="text-accent-purple">Records</span>
            </h1>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">
              シーズンを跨いだ通算記録
            </p>
          </div>
        </section>

        {/* Career Leaders */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
            Career <span className="text-accent-purple">Leaders</span>
          </h2>
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {LEADER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setLeaderCat(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  leaderCat === tab.key
                    ? "bg-accent-purple text-white font-medium"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-3 w-10" scope="col">
                      #
                    </th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3" scope="col">
                      選手
                    </th>
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-3" scope="col">
                      Seasons
                    </th>
                    <th className="text-right py-2 px-2 sm:py-3 sm:px-3" scope="col">
                      通算
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderRanking.map((c, i) => (
                    <tr key={c.memberId} className="border-b border-white/5">
                      <td className="text-center py-2 px-2 sm:py-3 sm:px-3 text-neutral-500 tabular-nums">
                        {i + 1}
                      </td>
                      <td className="py-2 px-2 sm:py-3 sm:px-3">
                        <Link
                          href={`/member/${c.memberId}`}
                          className="hover:text-accent-purple transition-colors"
                        >
                          {c.number !== null ? (
                            <span className="text-neutral-500 mr-1">
                              #{c.number}
                            </span>
                          ) : null}
                          {c.name}
                        </Link>
                      </td>
                      <td className="text-center py-2 px-2 sm:py-3 sm:px-3 tabular-nums text-neutral-400">
                        {c.seasonsPlayed}
                      </td>
                      <td className="text-right py-2 px-2 sm:py-3 sm:px-3 tabular-nums font-bold">
                        {leaderCat === "EFF"
                          ? fmt(getLeaderValue(c, leaderCat))
                          : getLeaderValue(c, leaderCat)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Career Totals Table */}
        <AnimatedSection className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
            Career <span className="text-accent-purple">Totals</span>
          </h2>
          <div className="flex justify-center mb-4">
            <ModeToggle mode={tableMode} onChange={setTableMode} />
          </div>
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    {TOTALS_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`text-${col.align} ${th}`}
                        scope="col"
                        tabIndex={0}
                        aria-sort={getAriaSortValue(col.key)}
                        onClick={() => handleSort(col.key)}
                        onKeyDown={(e) => handleSortKeyDown(e, col.key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <SortIcon
                            active={sortKey === col.key}
                            dir={sortDir}
                          />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedTotals.map((c) => {
                    const isAvg = tableMode === "average";
                    return (
                      <tr key={c.memberId} className="border-b border-white/5">
                        <td className={`text-left ${td}`}>
                          <Link
                            href={`/member/${c.memberId}`}
                            className="hover:text-accent-purple transition-colors"
                          >
                            {c.number !== null ? (
                              <span className="text-neutral-500 mr-1">
                                #{c.number}
                              </span>
                            ) : null}
                            {c.name}
                          </Link>
                        </td>
                        <td className={`text-center ${td} text-neutral-400`}>
                          {c.seasonsPlayed}
                        </td>
                        <td className={`text-center ${td} text-neutral-400`}>
                          {c.games}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.ppg) : c.totalPoints}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.rpg) : c.totalRebounds}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.apg) : c.totalAssists}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.spg) : c.totalSteals}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.bpg) : c.totalBlocks}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.topg) : c.totalTurnovers}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.pfpg) : c.totalPersonalFouls}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.fdpg) : c.totalFoulsDrawn}
                        </td>
                        <td className={`text-right ${td}`}>
                          {isAvg ? fmt(c.avgEff) : fmt(c.totalEff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* All-Time Single-Game Records */}
        {singleGameRecords.length > 0 ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
              Single-Game{" "}
              <span className="text-accent-purple">Records</span>
            </h2>
            <GlassCard>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400">
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap"
                        scope="col"
                      >
                        記録
                      </th>
                      <th
                        className="text-right py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap"
                        scope="col"
                      >
                        値
                      </th>
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap"
                        scope="col"
                      >
                        選手
                      </th>
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap hidden sm:table-cell"
                        scope="col"
                      >
                        試合
                      </th>
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap hidden sm:table-cell"
                        scope="col"
                      >
                        Season
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleGameRecords.map((r) => (
                      <tr key={r.title} className="border-b border-white/5">
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">
                          {r.title}
                        </td>
                        <td className="text-right py-2 px-2 sm:py-3 sm:px-3 tabular-nums font-bold text-accent-purple">
                          {r.value}
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap">
                          <Link
                            href={`/member/${r.memberId}`}
                            className="hover:text-accent-purple transition-colors"
                          >
                            {r.playerNumber !== null ? (
                              <span className="text-neutral-500 mr-1">
                                #{r.playerNumber}
                              </span>
                            ) : null}
                            {r.playerName}
                          </Link>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap text-neutral-400 hidden sm:table-cell">
                          vs {r.opponent} ({r.date.replace(/-/g, "/")})
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap text-neutral-500 hidden sm:table-cell">
                          {r.seasonLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </AnimatedSection>
        ) : null}

        {/* Milestones */}
        {milestones.length > 0 ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
              <span className="text-accent-purple">Milestones</span>
            </h2>
            <GlassCard>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400">
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap"
                        scope="col"
                      >
                        選手
                      </th>
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap"
                        scope="col"
                      >
                        マイルストーン
                      </th>
                      <th
                        className="text-right py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap"
                        scope="col"
                      >
                        通算値
                      </th>
                      <th
                        className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap hidden sm:table-cell"
                        scope="col"
                      >
                        達成試合
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr
                        key={`${m.memberId}-${m.title}`}
                        className="border-b border-white/5"
                      >
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap">
                          <Link
                            href={`/member/${m.memberId}`}
                            className="hover:text-accent-purple transition-colors"
                          >
                            {m.playerNumber !== null ? (
                              <span className="text-neutral-500 mr-1">
                                #{m.playerNumber}
                              </span>
                            ) : null}
                            {m.playerName}
                          </Link>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">
                          {m.title}
                        </td>
                        <td className="text-right py-2 px-2 sm:py-3 sm:px-3 tabular-nums font-bold text-accent-purple">
                          {m.value}
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap text-neutral-400 hidden sm:table-cell">
                          {m.detail ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </AnimatedSection>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
