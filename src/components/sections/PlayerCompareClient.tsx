"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import ProgressRing from "../ui/ProgressRing";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { shootingColors } from "@/config/theme";
import type { PlayerSummary, SeasonInfo, RosterPlayer } from "@/lib/types";
import { calcEff } from "@/lib/stats";

const PlayerCompareChart = dynamic(() => import("./PlayerCompareChart"), { ssr: false });

export interface GamePointsSlim {
  opponent: string;
  players: { number: number; points: number }[];
}

interface PlayerCompareClientProps {
  seasons: SeasonInfo[];
  players: PlayerSummary[];
  gamePoints: GamePointsSlim[];
  roster: RosterPlayer[];
  basePath?: string;
}

interface Row {
  label: string;
  values: [string, string];
  higherIsBetter: boolean;
}

function fmt(v: number, decimals = 1): string {
  return v.toFixed(decimals);
}

function fmtPct(v: number | null): string {
  if (v === null) return "-";
  return `${v.toFixed(1)}%`;
}

function getBestIndex(values: [string, string], higherIsBetter: boolean): number | null {
  const nums = values.map((v) => {
    const parsed = parseFloat(v);
    return isNaN(parsed) ? null : parsed;
  });
  if (nums[0] === null || nums[1] === null) return null;
  if (nums[0] === nums[1]) return null;
  if (higherIsBetter) return nums[0] > nums[1] ? 0 : 1;
  return nums[0] < nums[1] ? 0 : 1;
}

function getCompareRows(p1: PlayerSummary, p2: PlayerSummary): Row[] {
  const eff1 = p1.games > 0 ? calcPlayerEff(p1) / p1.games : 0;
  const eff2 = p2.games > 0 ? calcPlayerEff(p2) / p2.games : 0;

  return [
    { label: "GP", values: [String(p1.games), String(p2.games)], higherIsBetter: true },
    { label: "PPG", values: [fmt(p1.ppg), fmt(p2.ppg)], higherIsBetter: true },
    { label: "Total PTS", values: [String(p1.totalPoints), String(p2.totalPoints)], higherIsBetter: true },
    { label: "RPG", values: [fmt(p1.totalReb / (p1.games || 1)), fmt(p2.totalReb / (p2.games || 1))], higherIsBetter: true },
    { label: "APG", values: [fmt(p1.assists / (p1.games || 1)), fmt(p2.assists / (p2.games || 1))], higherIsBetter: true },
    { label: "SPG", values: [fmt(p1.steals / (p1.games || 1)), fmt(p2.steals / (p2.games || 1))], higherIsBetter: true },
    { label: "BPG", values: [fmt(p1.blocks / (p1.games || 1)), fmt(p2.blocks / (p2.games || 1))], higherIsBetter: true },
    { label: "3P%", values: [fmtPct(p1.threePointPct), fmtPct(p2.threePointPct)], higherIsBetter: true },
    { label: "3PM", values: [String(p1.threePointMade), String(p2.threePointMade)], higherIsBetter: true },
    { label: "2P%", values: [fmtPct(p1.twoPointPct), fmtPct(p2.twoPointPct)], higherIsBetter: true },
    { label: "FT%", values: [fmtPct(p1.ftPct), fmtPct(p2.ftPct)], higherIsBetter: true },
    { label: "TOV", values: [fmt(p1.turnovers / (p1.games || 1)), fmt(p2.turnovers / (p2.games || 1))], higherIsBetter: false },
    { label: "AVG EFF", values: [fmt(eff1), fmt(eff2)], higherIsBetter: true },
  ];
}

function calcPlayerEff(p: PlayerSummary): number {
  return calcEff({
    points: p.totalPoints,
    totalReb: p.totalReb,
    assists: p.assists,
    steals: p.steals,
    blocks: p.blocks,
    threePointMade: p.threePointMade,
    threePointAttempt: p.threePointAttempt,
    twoPointMade: p.twoPointMade,
    twoPointAttempt: p.twoPointAttempt,
    ftMade: p.ftMade,
    ftAttempt: p.ftAttempt,
    turnovers: p.turnovers,
  });
}

export default function PlayerCompareClient({ seasons, players, gamePoints, roster, basePath = "" }: PlayerCompareClientProps) {
  const searchParams = useSearchParams();
  const initialP1 = searchParams.get("p1") ?? "";
  const initialP2 = searchParams.get("p2") ?? "";

  const rosterPlayers = useMemo(() => {
    return roster
      .filter((m) => m.role === "player" && m.number !== null)
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
  }, [roster]);

  const playerMap = useMemo(() => {
    const map = new Map<number, PlayerSummary>();
    for (const p of players) map.set(p.number, p);
    return map;
  }, [players]);

  const findMemberByMemberId = (memberId: string) => rosterPlayers.find((m) => m.memberId === memberId);

  const defaultP1 = initialP1 && findMemberByMemberId(initialP1) ? initialP1 : (rosterPlayers[0]?.memberId ?? "");
  const defaultP2 = initialP2 && findMemberByMemberId(initialP2) ? initialP2 : (rosterPlayers[1]?.memberId ?? rosterPlayers[0]?.memberId ?? "");

  const router = useRouter();
  const pathname = usePathname();

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) params.set(k, v);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const [p1Id, setP1Id] = useState(defaultP1);
  const [p2Id, setP2Id] = useState(defaultP2);

  const handleP1Change = useCallback((id: string) => {
    setP1Id(id);
    updateUrl({ p1: id, p2: p2Id });
  }, [updateUrl, p2Id]);

  const handleP2Change = useCallback((id: string) => {
    setP2Id(id);
    updateUrl({ p1: p1Id, p2: id });
  }, [updateUrl, p1Id]);

  const p1Member = useMemo(() => rosterPlayers.find((m) => m.memberId === p1Id), [rosterPlayers, p1Id]);
  const p2Member = useMemo(() => rosterPlayers.find((m) => m.memberId === p2Id), [rosterPlayers, p2Id]);

  const p1Summary = p1Member?.number !== null && p1Member?.number !== undefined ? playerMap.get(p1Member.number) ?? null : null;
  const p2Summary = p2Member?.number !== null && p2Member?.number !== undefined ? playerMap.get(p2Member.number) ?? null : null;

  const rows = useMemo(() => {
    if (!p1Summary || !p2Summary) return [];
    return getCompareRows(p1Summary, p2Summary);
  }, [p1Summary, p2Summary]);

  const chartData = useMemo(() => {
    if (!p1Member || !p2Member) return [];
    const p1Num = p1Member.number;
    const p2Num = p2Member.number;

    return [...gamePoints].reverse().map((g) => {
      const p1Stat = p1Num !== null ? g.players.find((p) => p.number === p1Num) : null;
      const p2Stat = p2Num !== null ? g.players.find((p) => p.number === p2Num) : null;
      return {
        game: g.opponent,
        p1Pts: p1Stat?.points ?? null,
        p2Pts: p2Stat?.points ?? null,
      };
    }).filter((d) => d.p1Pts !== null || d.p2Pts !== null);
  }, [gamePoints, p1Member, p2Member]);

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
              Player <span className="text-accent-purple">Compare</span>
            </h1>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">2人の選手のスタッツを直接比較</p>
          </div>
        </section>

        {/* Player Selectors */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <select
              value={p1Id}
              onChange={(e) => handleP1Change(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-purple focus-visible:ring-2 focus-visible:ring-accent-purple cursor-pointer min-w-[200px]"
              aria-label="選手1を選択"
            >
              {rosterPlayers.map((m) => (
                <option key={m.memberId} value={m.memberId} className="bg-[#1a1a2e]">
                  #{m.number} {m.name}
                </option>
              ))}
            </select>
            <span className="text-neutral-400 font-bold text-lg">VS</span>
            <select
              value={p2Id}
              onChange={(e) => handleP2Change(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-purple focus-visible:ring-2 focus-visible:ring-accent-purple cursor-pointer min-w-[200px]"
              aria-label="選手2を選択"
            >
              {rosterPlayers.map((m) => (
                <option key={m.memberId} value={m.memberId} className="bg-[#1a1a2e]">
                  #{m.number} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Comparison Table */}
          {p1Summary && p2Summary ? (
            <GlassCard>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-xs sm:text-sm" aria-label="選手スタッツ比較">
                  <caption className="sr-only">
                    {p1Member?.name} vs {p2Member?.name} スタッツ比較
                  </caption>
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400">
                      <th className={th} scope="col">
                        #{p1Member?.number} {p1Member?.name}
                      </th>
                      <th className="text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap text-white" scope="col">指標</th>
                      <th className={th} scope="col">
                        #{p2Member?.number} {p2Member?.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const bestIdx = getBestIndex(row.values, row.higherIsBetter);
                      return (
                        <tr key={row.label} className="border-b border-white/5">
                          <td className={`${td} ${bestIdx === 0 ? "text-accent-purple font-bold" : ""}`}>
                            {row.values[0]}
                          </td>
                          <td className="text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium text-neutral-300">{row.label}</td>
                          <td className={`${td} ${bestIdx === 1 ? "text-accent-purple font-bold" : ""}`}>
                            {row.values[1]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="text-center text-neutral-400 text-sm">
              選手を選択してください
            </GlassCard>
          )}
        </AnimatedSection>

        {/* Shooting Comparison */}
        {p1Summary && p2Summary ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h2 className="text-2xl font-bold mb-6 text-center [text-wrap:balance]">
              Shooting <span className="text-accent-purple">Comparison</span>
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              {/* Player 1 */}
              <div>
                <div className="text-center text-sm text-neutral-400 mb-4">
                  #{p1Member?.number} {p1Member?.name}
                </div>
                <div className="flex justify-center gap-3 sm:gap-6">
                  <ProgressRing percentage={p1Summary.threePointPct} size={60} strokeWidth={5} color={shootingColors.threePoint} label="3P%" />
                  <ProgressRing percentage={p1Summary.twoPointPct} size={60} strokeWidth={5} color={shootingColors.twoPoint} label="2P%" />
                  <ProgressRing percentage={p1Summary.ftPct} size={60} strokeWidth={5} color={shootingColors.freeThrow} label="FT%" />
                </div>
              </div>
              {/* Player 2 */}
              <div>
                <div className="text-center text-sm text-neutral-400 mb-4">
                  #{p2Member?.number} {p2Member?.name}
                </div>
                <div className="flex justify-center gap-3 sm:gap-6">
                  <ProgressRing percentage={p2Summary.threePointPct} size={60} strokeWidth={5} color={shootingColors.threePoint} label="3P%" />
                  <ProgressRing percentage={p2Summary.twoPointPct} size={60} strokeWidth={5} color={shootingColors.twoPoint} label="2P%" />
                  <ProgressRing percentage={p2Summary.ftPct} size={60} strokeWidth={5} color={shootingColors.freeThrow} label="FT%" />
                </div>
              </div>
            </div>
          </AnimatedSection>
        ) : null}

        {/* Game-by-Game Line Chart */}
        {chartData.length > 1 && p1Member && p2Member ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h2 className="text-2xl font-bold mb-6 text-center [text-wrap:balance]">
              Scoring <span className="text-accent-purple">Trends</span>
            </h2>
            <GlassCard>
              <PlayerCompareChart
                data={chartData}
                p1Name={`#${p1Member.number} ${p1Member.name}`}
                p2Name={`#${p2Member.number} ${p2Member.name}`}
              />
            </GlassCard>
          </AnimatedSection>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
