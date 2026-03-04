"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import GlassCard from "../ui/GlassCard";
import AnimatedSection from "../ui/AnimatedSection";
import ProgressRing from "../ui/ProgressRing";
import StatCounter from "../ui/StatCounter";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { shootingColors } from "@/config/theme";
import type { PlayerSummary, GamePlayerStat } from "@/lib/types";

const tooltipStyle = {
  background: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
} as const;
const tooltipLabelStyle = { color: "#fff" } as const;

interface PlayerDetailClientProps {
  summary: PlayerSummary;
  games: { opponent: string; stat: GamePlayerStat }[];
}

export default function PlayerDetailClient({ summary, games }: PlayerDetailClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const p = summary;

  const lineData = games.map((g) => ({
    game: `vs ${g.opponent}`,
    PTS: g.stat.points,
    REB: g.stat.totalReb,
    AST: g.stat.assists,
  }));

  const mainStats = [
    { label: "PPG", value: p.ppg, decimals: 1 },
    { label: "RPG", value: p.totalReb / p.games, decimals: 1 },
    { label: "APG", value: p.assists / p.games, decimals: 1 },
    { label: "SPG", value: p.steals / p.games, decimals: 1 },
    { label: "BPG", value: p.blocks / p.games, decimals: 1 },
    { label: "TPG", value: p.turnovers / p.games, decimals: 1 },
  ];

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#0a0a0f]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 sm:mb-8">
              <ArrowLeft size={18} /> Back to Roster
            </Link>
            <motion.div initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}>
              <div className="text-6xl sm:text-8xl md:text-9xl font-bold text-accent-orange/20">#{p.number}</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold -mt-4 sm:-mt-6">{p.name}</h1>
              <p className="text-sm sm:text-base text-neutral-400 mt-2">{p.games} Games Played | Total {p.totalPoints} Points</p>
            </motion.div>
          </div>
        </section>

        {/* Season Summary */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Season Summary</h2>
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

        {/* Scoring Trend */}
        {games.length > 1 && (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-2xl font-bold mb-6">Game-by-Game</h2>
            <GlassCard>
              <p className="sr-only">試合ごとの得点・リバウンド・アシストの推移を示すラインチャート。</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={lineData} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="game" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                  />
                  <Line type="monotone" dataKey="PTS" stroke="#f97316" strokeWidth={3} dot={{ r: 5, fill: "#f97316" }} />
                  <Line type="monotone" dataKey="REB" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="AST" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: "#22c55e" }} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </AnimatedSection>
        )}

        {/* Game Details Table */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Game Log</h2>
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm" aria-label={`${p.name} ゲームログ`}>
                <caption className="sr-only">{p.name}の各試合スタッツ</caption>
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="text-left py-2 px-1 sm:py-3 sm:px-2 whitespace-nowrap" scope="col">対戦</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell" scope="col">GS</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">PTS</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">3P</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">2P</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">FT</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">REB</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">AST</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">STL</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell" scope="col">BLK</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">TO</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell" scope="col">MIN</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.opponent} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 px-1 sm:py-3 sm:px-2 font-medium whitespace-nowrap">vs {g.opponent}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell">{g.stat.starter ? <span aria-label="スターター">●</span> : ""}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2 font-bold text-accent-orange">{g.stat.points}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.threePointMade}/{g.stat.threePointAttempt}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.twoPointMade}/{g.stat.twoPointAttempt}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.ftMade}/{g.stat.ftAttempt}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.totalReb}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.assists}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.steals}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell">{g.stat.blocks}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{g.stat.turnovers}</td>
                      <td className="text-center py-2 px-1 sm:py-3 sm:px-2 text-neutral-400 hidden sm:table-cell">{g.stat.minutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}
