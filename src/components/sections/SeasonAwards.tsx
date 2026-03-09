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
      className="text-white hover:text-accent-purple transition-colors font-medium"
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center [text-wrap:balance]">
        Season <span className="text-accent-purple">Awards</span>
      </h2>

      {/* MVP Card */}
      {awards.mvp ? (
        <div className="mb-8 sm:mb-10">
          <GlassCard className="relative overflow-hidden border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/30 shrink-0">
                <Trophy size={28} className="text-yellow-400" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs text-yellow-400 font-semibold tracking-wider uppercase mb-1">Season MVP</div>
                <div className="text-2xl sm:text-3xl font-bold">
                  <AwardPlayerLink award={awards.mvp} basePath={basePath} />
                </div>
                {awards.mvp.detail ? (
                  <div className="text-sm text-neutral-400 mt-1">{awards.mvp.detail}</div>
                ) : null}
              </div>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {/* Category Leaders Grid */}
      {awards.categoryLeaders.length > 0 ? (
        <div className="mb-8 sm:mb-10">
          <h3 className="text-lg font-semibold mb-4 text-neutral-300">Category Leaders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {awards.categoryLeaders.map((award) => (
              <GlassCard key={award.title} className="text-center">
                <div className="flex justify-center mb-2 text-accent-purple">
                  {categoryIcons[award.title] ?? <Trophy size={16} aria-hidden="true" />}
                </div>
                <div className="text-xs text-neutral-400 mb-1">{award.title}</div>
                <div className="text-lg font-bold text-accent-purple tabular-nums">{award.value}</div>
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
          <h3 className="text-lg font-semibold mb-4 text-neutral-300">Best Game Records</h3>
          <GlassCard>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm" aria-label="ベストゲーム記録">
                <caption className="sr-only">シーズンベストゲーム記録</caption>
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap" scope="col">記録</th>
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap" scope="col">値</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap" scope="col">選手</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap hidden sm:table-cell" scope="col">試合</th>
                  </tr>
                </thead>
                <tbody>
                  {awards.bestGameRecords.map((award) => (
                    <tr key={award.title} className="border-b border-white/5">
                      <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap font-medium">{award.title}</td>
                      <td className="text-center py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap tabular-nums font-bold text-accent-purple">{award.value}</td>
                      <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap">
                        <AwardPlayerLink award={award} basePath={basePath} />
                      </td>
                      <td className="text-left py-2 px-2 sm:py-3 sm:px-3 whitespace-nowrap text-neutral-400 hidden sm:table-cell">{award.detail}</td>
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
          <h3 className="text-lg font-semibold mb-4 text-neutral-300">Milestones</h3>
          <div className="flex flex-wrap gap-3">
            {awards.milestones.map((award) => (
              <GlassCard key={`${award.title}-${award.memberId}`} className="inline-flex items-center gap-3">
                <AwardIcon size={16} className="text-yellow-400 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-medium">
                    <AwardPlayerLink award={award} basePath={basePath} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="yellow">{award.title}</Badge>
                    <span className="text-xs text-neutral-400 tabular-nums">{award.value}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}
    </AnimatedSection>
  );
}
