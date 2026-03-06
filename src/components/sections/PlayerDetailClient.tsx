"use client";

import Link from "next/link";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const PlayerGameChart = dynamic(() => import("./PlayerGameChart"), { ssr: false });
import AnimatedSection from "../ui/AnimatedSection";
import ProgressRing from "../ui/ProgressRing";
import StatCounter from "../ui/StatCounter";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { shootingColors } from "@/config/theme";
import type { PlayerSummary, GamePlayerStat } from "@/lib/types";

function fmtPct(made: number, attempt: number): string {
  if (attempt === 0) return "-";
  return `${((made / attempt) * 100).toFixed(1)}%`;
}

function calcEff(s: { points: number; totalReb: number; assists: number; steals: number; blocks: number; threePointMade: number; threePointAttempt: number; twoPointMade: number; twoPointAttempt: number; ftMade: number; ftAttempt: number; turnovers: number }) {
  const fgm = s.threePointMade + s.twoPointMade;
  const fga = s.threePointAttempt + s.twoPointAttempt;
  return (s.points + s.totalReb + s.assists + s.steals + s.blocks) - ((fga - fgm) + (s.ftAttempt - s.ftMade) + s.turnovers);
}

interface PlayerDetailClientProps {
  summary: PlayerSummary;
  games: { opponent: string; date: string; stat: GamePlayerStat }[];
}

export default function PlayerDetailClient({ summary, games }: PlayerDetailClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const p = summary;

  const lineData = useMemo(() => games.map((g) => ({
    game: `${(g.date ?? "").slice(5).replace("-", "/")} ${g.opponent}`,
    PTS: g.stat.points,
    REB: g.stat.totalReb,
    AST: g.stat.assists,
  })), [games]);

  const seasonEff = calcEff({
    points: p.totalPoints, totalReb: p.totalReb, assists: p.assists, steals: p.steals, blocks: p.blocks,
    threePointMade: p.threePointMade, threePointAttempt: p.threePointAttempt,
    twoPointMade: p.twoPointMade, twoPointAttempt: p.twoPointAttempt,
    ftMade: p.ftMade, ftAttempt: p.ftAttempt, turnovers: p.turnovers,
  });

  const mainStats = useMemo(() => [
    { label: "PPG", value: p.ppg, decimals: 1 },
    { label: "RPG", value: p.totalReb / p.games, decimals: 1 },
    { label: "APG", value: p.assists / p.games, decimals: 1 },
    { label: "SPG", value: p.steals / p.games, decimals: 1 },
    { label: "BPG", value: p.blocks / p.games, decimals: 1 },
    { label: "EFF", value: seasonEff / p.games, decimals: 1 },
  ], [p.ppg, p.totalReb, p.games, p.assists, p.steals, p.blocks, seasonEff]);

  const totals = useMemo(() => {
    const t = {
      points: 0, threePointMade: 0, threePointAttempt: 0,
      twoPointMade: 0, twoPointAttempt: 0,
      ftMade: 0, ftAttempt: 0,
      offReb: 0, defReb: 0, totalReb: 0,
      assists: 0, steals: 0, blocks: 0, turnovers: 0,
      personalFouls: 0, foulsDrawn: 0, totalMinutes: 0,
    };
    for (const g of games) {
      const s = g.stat;
      t.points += s.points;
      t.threePointMade += s.threePointMade;
      t.threePointAttempt += s.threePointAttempt;
      t.twoPointMade += s.twoPointMade;
      t.twoPointAttempt += s.twoPointAttempt;
      t.ftMade += s.ftMade;
      t.ftAttempt += s.ftAttempt;
      t.offReb += s.offReb;
      t.defReb += s.defReb;
      t.totalReb += s.totalReb;
      t.assists += s.assists;
      t.steals += s.steals;
      t.blocks += s.blocks;
      t.turnovers += s.turnovers;
      t.personalFouls += s.personalFouls;
      t.foulsDrawn += s.foulsDrawn;
      t.totalMinutes += parseMinutes(s.minutes);
    }
    return t;
  }, [games]);

  const th = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";
  const td = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap tabular-nums";

  return (
    <>
      <Header />
      <main id="main-content" className="pt-16">
        {/* Hero */}
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#0a0a0f]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 sm:mb-8 rounded">
              <ArrowLeft size={18} aria-hidden="true" /> Back to Roster
            </Link>
            <motion.div initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}>
              <div className="text-6xl sm:text-8xl md:text-9xl font-bold text-accent-purple/20">#{p.number}</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold -mt-4 sm:-mt-6">{p.name}</h1>
              <p className="text-sm sm:text-base text-neutral-400 mt-2">{p.games} Games Played | Total {p.totalPoints} Points</p>
            </motion.div>
          </div>
        </section>

        {/* Season Summary */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold mb-6 [text-wrap:balance]">Season Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {mainStats.map((s) => (
              <GlassCard key={s.label} className="text-center">
                <div className="text-2xl font-bold">
                  <StatCounter end={s.value} decimals={s.decimals} />
                </div>
                <div className="text-xs text-neutral-400 mt-1">{s.label}</div>
              </GlassCard>
            ))}
          </div>

          <div className="flex justify-center gap-4 sm:gap-8 md:gap-16">
            <ProgressRing percentage={p.threePointPct} size={70} strokeWidth={6} color={shootingColors.threePoint} label="3P%" />
            <ProgressRing percentage={p.twoPointPct} size={70} strokeWidth={6} color={shootingColors.twoPoint} label="2P%" />
            <ProgressRing percentage={p.ftPct} size={70} strokeWidth={6} color={shootingColors.freeThrow} label="FT%" />
          </div>
        </AnimatedSection>

        {/* Season Totals */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold mb-6 [text-wrap:balance]">Season Totals</h2>
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm min-w-[800px]" aria-label={`${p.name} シーズン合計`}>
                <caption className="sr-only">{p.name}のシーズン合計スタッツ</caption>
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className={th} scope="col">GP</th>
                    <th className={th} scope="col">PTS</th>
                    <th className={th} scope="col">3P</th>
                    <th className={th} scope="col">3P%</th>
                    <th className={th} scope="col">2P</th>
                    <th className={th} scope="col">2P%</th>
                    <th className={th} scope="col">FT</th>
                    <th className={th} scope="col">FT%</th>
                    <th className={th} scope="col">OR</th>
                    <th className={th} scope="col">DR</th>
                    <th className={th} scope="col">REB</th>
                    <th className={th} scope="col">AST</th>
                    <th className={th} scope="col">STL</th>
                    <th className={th} scope="col">BLK</th>
                    <th className={th} scope="col">TO</th>
                    <th className={th} scope="col">PF</th>
                    <th className={th} scope="col">FD</th>
                    <th className={th} scope="col">MIN</th>
                    <th className={th} scope="col">EFF</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${td} font-semibold`}>{p.games}</td>
                    <td className={`${td} font-bold text-accent-purple`}>{totals.points}</td>
                    <td className={td}>{totals.threePointMade}/{totals.threePointAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(totals.threePointMade, totals.threePointAttempt)}</td>
                    <td className={td}>{totals.twoPointMade}/{totals.twoPointAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(totals.twoPointMade, totals.twoPointAttempt)}</td>
                    <td className={td}>{totals.ftMade}/{totals.ftAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(totals.ftMade, totals.ftAttempt)}</td>
                    <td className={td}>{totals.offReb}</td>
                    <td className={td}>{totals.defReb}</td>
                    <td className={`${td} font-semibold`}>{totals.totalReb}</td>
                    <td className={td}>{totals.assists}</td>
                    <td className={td}>{totals.steals}</td>
                    <td className={td}>{totals.blocks}</td>
                    <td className={td}>{totals.turnovers}</td>
                    <td className={td}>{totals.personalFouls}</td>
                    <td className={td}>{totals.foulsDrawn}</td>
                    <td className={`${td} text-neutral-400`}>{formatMinutes(totals.totalMinutes)}</td>
                    <td className={`${td} font-bold text-accent-purple`}>{seasonEff}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Scoring Trend */}
        {games.length > 1 && (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-2xl font-bold mb-6 [text-wrap:balance]">Game-by-Game</h2>
            <GlassCard>
              <p className="sr-only">試合ごとの得点・リバウンド・アシストの推移を示すラインチャート。</p>
              <PlayerGameChart data={lineData} />
            </GlassCard>
          </AnimatedSection>
        )}

        {/* Game Log */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold mb-6 [text-wrap:balance]">Game Log</h2>
          <GlassCard className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[900px]" aria-label={`${p.name} ゲームログ`}>
                <caption className="sr-only">{p.name}の各試合スタッツ</caption>
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="text-left py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 whitespace-nowrap sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10" scope="col">対戦</th>
                    <th className={th} scope="col">GS</th>
                    <th className={th} scope="col">PTS</th>
                    <th className={th} scope="col">3P</th>
                    <th className={th} scope="col">3P%</th>
                    <th className={th} scope="col">2P</th>
                    <th className={th} scope="col">2P%</th>
                    <th className={th} scope="col">FT</th>
                    <th className={th} scope="col">FT%</th>
                    <th className={th} scope="col">OR</th>
                    <th className={th} scope="col">DR</th>
                    <th className={th} scope="col">REB</th>
                    <th className={th} scope="col">AST</th>
                    <th className={th} scope="col">STL</th>
                    <th className={th} scope="col">BLK</th>
                    <th className={th} scope="col">TO</th>
                    <th className={th} scope="col">PF</th>
                    <th className={th} scope="col">FD</th>
                    <th className={th} scope="col">MIN</th>
                    <th className={th} scope="col">EFF</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.opponent} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 font-medium whitespace-nowrap sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10">
                        <span className="text-neutral-400 mr-2 text-xs">{(g.date ?? "").replace(/-/g, "/")}</span>vs {g.opponent}
                      </td>
                      <td className={td}>{g.stat.starter ? <span aria-label="スターター">●</span> : null}</td>
                      <td className={`${td} font-bold text-accent-purple`}>{g.stat.points}</td>
                      <td className={td}>{g.stat.threePointMade}/{g.stat.threePointAttempt}</td>
                      <td className={`${td} text-neutral-400`}>{fmtPct(g.stat.threePointMade, g.stat.threePointAttempt)}</td>
                      <td className={td}>{g.stat.twoPointMade}/{g.stat.twoPointAttempt}</td>
                      <td className={`${td} text-neutral-400`}>{fmtPct(g.stat.twoPointMade, g.stat.twoPointAttempt)}</td>
                      <td className={td}>{g.stat.ftMade}/{g.stat.ftAttempt}</td>
                      <td className={`${td} text-neutral-400`}>{fmtPct(g.stat.ftMade, g.stat.ftAttempt)}</td>
                      <td className={td}>{g.stat.offReb}</td>
                      <td className={td}>{g.stat.defReb}</td>
                      <td className={`${td} font-semibold`}>{g.stat.totalReb}</td>
                      <td className={td}>{g.stat.assists}</td>
                      <td className={td}>{g.stat.steals}</td>
                      <td className={td}>{g.stat.blocks}</td>
                      <td className={td}>{g.stat.turnovers}</td>
                      <td className={td}>{g.stat.personalFouls}</td>
                      <td className={td}>{g.stat.foulsDrawn}</td>
                      <td className={`${td} text-neutral-400`}>{g.stat.minutes}</td>
                      <td className={`${td} font-bold text-accent-purple`}>{calcEff(g.stat)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 font-semibold">
                    <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10">TOTAL</td>
                    <td className={td}></td>
                    <td className={`${td} text-accent-purple`}>{totals.points}</td>
                    <td className={td}>{totals.threePointMade}/{totals.threePointAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(totals.threePointMade, totals.threePointAttempt)}</td>
                    <td className={td}>{totals.twoPointMade}/{totals.twoPointAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(totals.twoPointMade, totals.twoPointAttempt)}</td>
                    <td className={td}>{totals.ftMade}/{totals.ftAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(totals.ftMade, totals.ftAttempt)}</td>
                    <td className={td}>{totals.offReb}</td>
                    <td className={td}>{totals.defReb}</td>
                    <td className={td}>{totals.totalReb}</td>
                    <td className={td}>{totals.assists}</td>
                    <td className={td}>{totals.steals}</td>
                    <td className={td}>{totals.blocks}</td>
                    <td className={td}>{totals.turnovers}</td>
                    <td className={td}>{totals.personalFouls}</td>
                    <td className={td}>{totals.foulsDrawn}</td>
                    <td className={`${td} text-neutral-400`}>{formatMinutes(totals.totalMinutes)}</td>
                    <td className={`${td} font-bold text-accent-purple`}>{seasonEff}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}

function parseMinutes(min: string): number {
  if (!min) return 0;
  const parts = min.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}

function formatMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
