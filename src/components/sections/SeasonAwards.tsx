"use client";

import Link from "next/link";
import { Trophy, Crown, Star, Award as AwardIcon } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedSection from "../ui/AnimatedSection";
import Badge from "../ui/Badge";
import type { Award, SeasonAwardSet } from "@/lib/types";

interface SeasonAwardsProps {
  awards: SeasonAwardSet;
  basePath?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "得点王": <Crown size={16} aria-hidden="true" />,
  "3P王": <Star size={16} aria-hidden="true" />,
  "リバウンド王": <Trophy size={16} aria-hidden="true" />,
  "アシスト王": <Trophy size={16} aria-hidden="true" />,
  "スティール王": <Trophy size={16} aria-hidden="true" />,
  "ブロック王": <Trophy size={16} aria-hidden="true" />,
  "EFF王": <Crown size={16} aria-hidden="true" />,
};

const categoryBadgeVariant: Record<string, "purple" | "blue" | "green" | "pink" | "cyan" | "yellow" | "red" | "orange"> = {
  "得点王": "purple",
  "3P王": "pink",
  "リバウンド王": "blue",
  "アシスト王": "green",
  "スティール王": "cyan",
  "ブロック王": "yellow",
  "EFF王": "purple",
};

function AwardPlayerLink({ award, basePath }: { award: Award; basePath: string }) {
  return (
    <Link
      href={`${basePath}/member/${award.memberId}`}
      className="text-foreground hover:text-accent-purple transition-colors font-medium"
    >
      {award.playerNumber !== null ? `#${award.playerNumber} ` : ""}{award.playerName}
    </Link>
  );
}

export default function SeasonAwards({ awards, basePath = "" }: SeasonAwardsProps) {
  const hasAwards = awards.mvp || awards.categoryLeaders.length > 0 || awards.bestGameRecords.length > 0 || awards.milestones.length > 0;
  if (!hasAwards) return null;

  return (
    <AnimatedSection className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16" id="season-awards">
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center uppercase tracking-wider">
        Season <span className="text-accent-purple">Awards</span>
      </h2>
      <div className="court-divider mb-8 sm:mb-10" aria-hidden="true" />

      {/* MVP Card */}
      {awards.mvp ? (
        <div className="mb-8 sm:mb-10">
          <GlassCard className="relative overflow-hidden !border-accent-gold/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                <Trophy size={28} className="text-accent-gold" aria-hidden="true" />
              </div>
              <div>
                <div className="font-[family-name:var(--font-barlow-condensed)] text-[10px] text-accent-gold font-bold tracking-[0.3em] uppercase mb-1">Season MVP</div>
                <div className="stat-number text-2xl sm:text-3xl">
                  <AwardPlayerLink award={awards.mvp} basePath={basePath} />
                </div>
                {awards.mvp.detail ? (
                  <div className="text-sm text-neutral-500 mt-1">{awards.mvp.detail}</div>
                ) : null}
              </div>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {/* Category Leaders Grid */}
      {awards.categoryLeaders.length > 0 ? (
        <div className="mb-8 sm:mb-10">
          <h3 className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold mb-4 uppercase tracking-[0.2em] text-neutral-500">Category Leaders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {awards.categoryLeaders.map((award) => (
              <GlassCard key={award.title} className="text-center">
                <div className="flex justify-center mb-2 text-accent-purple">
                  {categoryIcons[award.title] ?? <Trophy size={16} aria-hidden="true" />}
                </div>
                <div className="text-[10px] text-neutral-500 mb-1 font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider">{award.title}</div>
                <div className="stat-number text-lg text-accent-purple tabular-nums">{award.value}</div>
                <div className="text-sm mt-1">
                  <AwardPlayerLink award={award} basePath={basePath} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}

      {/* Best Game Records */}
      {awards.bestGameRecords.length > 0 ? (
        <div className="mb-8 sm:mb-10">
          <h3 className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold mb-4 uppercase tracking-[0.2em] text-neutral-500">Best Game Records</h3>
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm" aria-label="ベストゲーム記録">
                <caption className="sr-only">シーズンベストゲーム記録</caption>
                <thead>
                  <tr className="border-b border-accent-purple/10 text-neutral-500">
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider text-[10px]" scope="col">記録</th>
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider text-[10px]" scope="col">値</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider text-[10px]" scope="col">選手</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap hidden sm:table-cell font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider text-[10px]" scope="col">試合</th>
                  </tr>
                </thead>
                <tbody>
                  {awards.bestGameRecords.map((award) => (
                    <tr key={award.title} className="border-b border-white/3">
                      <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">{award.title}</td>
                      <td className="text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap tabular-nums stat-number text-accent-purple">{award.value}</td>
                      <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap">
                        <AwardPlayerLink award={award} basePath={basePath} />
                      </td>
                      <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap text-neutral-500 hidden sm:table-cell">{award.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {/* Milestones */}
      {awards.milestones.length > 0 ? (
        <div>
          <h3 className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold mb-4 uppercase tracking-[0.2em] text-neutral-500">Milestones</h3>
          <div className="flex flex-wrap gap-2">
            {awards.milestones.map((award) => (
              <GlassCard key={`${award.title}-${award.memberId}`} className="inline-flex items-center gap-3">
                <AwardIcon size={16} className="text-accent-gold shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-medium">
                    <AwardPlayerLink award={award} basePath={basePath} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="yellow">{award.title}</Badge>
                    <span className="text-xs text-neutral-500 tabular-nums">{award.value}</span>
                  </div>
                  {award.detail ? (
                    <div className="text-xs text-neutral-600 mt-0.5">{award.detail}</div>
                  ) : null}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}
    </AnimatedSection>
  );
}
