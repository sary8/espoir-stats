"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, GitCompareArrows } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const PlayerGameChart = dynamic(() => import("./PlayerGameChart"), { ssr: false });
import AnimatedSection from "../ui/AnimatedSection";
import ProgressRing from "../ui/ProgressRing";
import StatCounter from "../ui/StatCounter";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import PrevNextNav from "../ui/PrevNextNav";
import Badge from "../ui/Badge";
import { shootingColors } from "@/config/theme";
import type { PlayerSummary, GamePlayerStat, SeasonInfo, RosterPlayer, MemberRole, Award, CrossSeasonMember } from "@/lib/types";
import { getRoleLabel, isStaffRole } from "@/lib/types";
import { calcEff, parseMinutesToSeconds } from "@/lib/stats";
import PlayerGrowthSection from "./PlayerGrowthSection";

interface TopBadges {
  topScorer: number;
  topRebounder: number;
  topAssister: number;
  top3P: number;
  topStealer: number;
  topBlocker: number;
  topFoul: number;
  topTurnover: number;
}

function fmtPct(made: number, attempt: number): string {
  if (attempt === 0) return "-";
  return `${((made / attempt) * 100).toFixed(1)}%`;
}

interface AdjacentMember {
  memberId: string;
  number: number | null;
  name: string;
  role: MemberRole;
}

interface AdjacentPlayer {
  prev: AdjacentMember | null;
  next: AdjacentMember | null;
}

interface PlayerDetailClientProps {
  member: RosterPlayer;
  summary: PlayerSummary | null;
  games: { gameId: string; opponent: string; date: string; stat: GamePlayerStat }[];
  basePath?: string;
  seasons?: SeasonInfo[];
  seasonLabel?: string;
  seasonId?: string;
  adjacentPlayers?: AdjacentPlayer;
  badges?: TopBadges;
  playerAwards?: Award[];
  crossSeasonData?: CrossSeasonMember;
}

function getMemberLabel(member: RosterPlayer): string {
  return member.number !== null ? `#${member.number}` : getRoleLabel(member.role);
}

function getMemberStatus(member: RosterPlayer, summary: PlayerSummary | null): string {
  if (isStaffRole(member.role)) return getRoleLabel(member.role);
  return summary ? `${summary.games} Games Played | Total ${summary.totalPoints} Points` : "Season DNP";
}

const awardBadgeVariant: Record<string, "purple" | "blue" | "green" | "pink" | "cyan" | "yellow" | "red" | "orange"> = {
  "Season MVP": "yellow",
  "得点王": "purple",
  "3P王": "pink",
  "リバウンド王": "blue",
  "アシスト王": "green",
  "スティール王": "cyan",
  "ブロック王": "yellow",
  "EFF王": "purple",
  "1試合最多得点": "red",
  "1試合最多3P": "pink",
  "1試合最高EFF": "purple",
  "1試合最多リバウンド": "blue",
  "1試合最多アシスト": "green",
  "1試合最多スティール": "cyan",
  "1試合最多ファール": "red",
  "1試合最多ターンオーバー": "orange",
  "1試合最多ファールドローン": "green",
  "通算100得点達成": "yellow",
  "通算50試合出場": "yellow",
};

export default function PlayerDetailClient({ member, summary, games, basePath = "", seasons, seasonLabel, seasonId, adjacentPlayers, badges, playerAwards, crossSeasonData }: PlayerDetailClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const p = member;

  const lineData = useMemo(() => [...games].reverse().map((g) => ({
    game: g.opponent,
    PTS: g.stat.points,
    REB: g.stat.totalReb,
    AST: g.stat.assists,
  })), [games]);

  const seasonEff = summary ? calcEff({
    points: summary.totalPoints, totalReb: summary.totalReb, assists: summary.assists, steals: summary.steals, blocks: summary.blocks,
    threePointMade: summary.threePointMade, threePointAttempt: summary.threePointAttempt,
    twoPointMade: summary.twoPointMade, twoPointAttempt: summary.twoPointAttempt,
    ftMade: summary.ftMade, ftAttempt: summary.ftAttempt, turnovers: summary.turnovers,
  }) : 0;

  const mainStats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "PPG", value: summary.ppg, decimals: 1 },
      { label: "RPG", value: summary.totalReb / summary.games, decimals: 1 },
      { label: "APG", value: summary.assists / summary.games, decimals: 1 },
      { label: "SPG", value: summary.steals / summary.games, decimals: 1 },
      { label: "BPG", value: summary.blocks / summary.games, decimals: 1 },
      { label: "EFF", value: seasonEff / summary.games, decimals: 1 },
    ];
  }, [summary, seasonEff]);

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
      t.totalMinutes += parseMinutesToSeconds(s.minutes);
    }
    return t;
  }, [games]);

  const th = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";
  const td = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap tabular-nums";

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        {/* Hero */}
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#06060c]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <Link href={`${basePath}/members`} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors rounded">
                <ArrowLeft size={18} aria-hidden="true" /> Back to Members
              </Link>
              {adjacentPlayers ? (
                <div className="flex items-center gap-2">
                  {adjacentPlayers.prev ? (
                    <Link href={`${basePath}/member/${adjacentPlayers.prev.memberId}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-neutral-400 hover:text-white transition-colors">
                      <ChevronLeft size={14} aria-hidden="true" />
                      <span className="hidden sm:inline">{getMemberLabel({ ...adjacentPlayers.prev, role: adjacentPlayers.prev.role, hasImage: false })} {adjacentPlayers.prev.name}</span>
                      <span className="sm:hidden">{getMemberLabel({ ...adjacentPlayers.prev, role: adjacentPlayers.prev.role, hasImage: false })}</span>
                    </Link>
                  ) : null}
                  {adjacentPlayers.next ? (
                    <Link href={`${basePath}/member/${adjacentPlayers.next.memberId}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-neutral-400 hover:text-white transition-colors">
                      <span className="hidden sm:inline">{getMemberLabel({ ...adjacentPlayers.next, role: adjacentPlayers.next.role, hasImage: false })} {adjacentPlayers.next.name}</span>
                      <span className="sm:hidden">{getMemberLabel({ ...adjacentPlayers.next, role: adjacentPlayers.next.role, hasImage: false })}</span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
            <motion.div initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }} className="flex items-end justify-between gap-4">
              <div>
                <div className="stat-number text-5xl sm:text-7xl md:text-8xl text-accent-purple/15">{getMemberLabel(p)}</div>
                <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl md:text-5xl font-bold -mt-4 sm:-mt-6 uppercase tracking-wider">{p.name}</h1>
                <p className="text-sm sm:text-base text-neutral-400 mt-2">
                  {getMemberStatus(p, summary)}
                </p>
                {playerAwards && playerAwards.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {playerAwards.map((award) => (
                      <Badge key={award.title} variant={awardBadgeVariant[award.title] ?? "purple"}>
                        {award.title}
                      </Badge>
                    ))}
                  </div>
                ) : badges && p.number !== null ? (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.number === badges.topScorer ? <Badge variant="purple">Top Scorer</Badge> : null}
                    {p.number === badges.topRebounder ? <Badge variant="blue">Top Rebounder</Badge> : null}
                    {p.number === badges.topAssister ? <Badge variant="green">Top Assists</Badge> : null}
                    {p.number === badges.top3P ? <Badge variant="pink">Top 3P</Badge> : null}
                    {p.number === badges.topStealer ? <Badge variant="cyan">Top Steals</Badge> : null}
                    {p.number === badges.topBlocker ? <Badge variant="yellow">Top Blocks</Badge> : null}
                    {p.number === badges.topFoul ? <Badge variant="red">Top Fouls</Badge> : null}
                    {p.number === badges.topTurnover ? <Badge variant="orange">Top Turnovers</Badge> : null}
                  </div>
                ) : null}
                {p.role === "player" ? (
                  <Link
                    href={`${basePath}/player-compare?p1=${p.memberId}`}
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    <GitCompareArrows size={14} aria-hidden="true" />
                    Compare
                  </Link>
                ) : null}
              </div>
              {seasonId && p.hasImage ? (
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 shrink-0">
                  <Image
                    src={`/api/players/${seasonId}/${p.memberId}.png`}
                    alt={`${p.name}のプロフィール写真`}
                    fill
                    unoptimized
                    priority
                    className="object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                    sizes="(max-width: 640px) 192px, (max-width: 768px) 240px, 288px"
                  />
                </div>
              ) : seasonId ? (
                <div className="flex h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 shrink-0 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-center">
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold text-accent-purple/70">{getMemberLabel(p)}</div>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-400">No Photo</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </section>

        {!summary ? null : (
          <>
        {/* Season Summary */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-bold mb-6 uppercase tracking-wider">Season Summary</h2>
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
            <ProgressRing percentage={summary.threePointPct} size={70} strokeWidth={6} color={shootingColors.threePoint} label="3P%" />
            <ProgressRing percentage={summary.twoPointPct} size={70} strokeWidth={6} color={shootingColors.twoPoint} label="2P%" />
            <ProgressRing percentage={summary.ftPct} size={70} strokeWidth={6} color={shootingColors.freeThrow} label="FT%" />
          </div>
        </AnimatedSection>

        {/* Season Totals */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-bold mb-6 uppercase tracking-wider">Season Totals</h2>
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
                    <td className={`${td} font-semibold`}>{summary.games}</td>
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
        {games.length > 1 ? (
          <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-bold mb-6 uppercase tracking-wider">Game-by-Game</h2>
            <GlassCard>
              <p className="sr-only">試合ごとの得点・リバウンド・アシストの推移を示すラインチャート。</p>
              <PlayerGameChart data={lineData} />
            </GlassCard>
          </AnimatedSection>
        ) : null}

        {/* Game Log */}
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-bold mb-6 uppercase tracking-wider">Game Log</h2>
          <GlassCard className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[900px]" aria-label={`${p.name} ゲームログ`}>
                <caption className="sr-only">{p.name}の各試合スタッツ</caption>
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="text-left py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 whitespace-nowrap sticky left-0 bg-[#06060c] z-10 border-r border-white/10" scope="col">対戦</th>
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
                    <tr key={g.gameId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 font-medium whitespace-nowrap sticky left-0 bg-[#06060c] z-10 border-r border-white/10">
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
                    <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 sticky left-0 bg-[#06060c] z-10 border-r border-white/10">TOTAL</td>
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
          </>
        )}

        {crossSeasonData && crossSeasonData.seasons.length >= 2 ? (
          <PlayerGrowthSection crossSeasonData={crossSeasonData} />
        ) : null}

        {adjacentPlayers ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
            <PrevNextNav
              prev={adjacentPlayers.prev ? { href: `${basePath}/member/${adjacentPlayers.prev.memberId}`, label: getMemberLabel({ ...adjacentPlayers.prev, role: adjacentPlayers.prev.role, hasImage: false }), sublabel: adjacentPlayers.prev.name } : null}
              next={adjacentPlayers.next ? { href: `${basePath}/member/${adjacentPlayers.next.memberId}`, label: getMemberLabel({ ...adjacentPlayers.next, role: adjacentPlayers.next.role, hasImage: false }), sublabel: adjacentPlayers.next.name } : null}
            />
          </div>
        ) : null}
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}

function formatMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
