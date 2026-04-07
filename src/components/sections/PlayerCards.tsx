"use client";

import Link from "next/link";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import ProgressRing from "../ui/ProgressRing";
import Badge from "../ui/Badge";
import SeasonSwitcher from "../ui/SeasonSwitcher";
import type { PlayerListEntry, SeasonInfo } from "@/lib/types";
import { getRoleLabel, isStaffRole } from "@/lib/types";
import { shootingColors } from "@/config/theme";

interface PlayerCardsProps {
  members: PlayerListEntry[];
  topScorer: number;
  topRebounder: number;
  topAssister: number;
  top3P: number;
  topStealer: number;
  topBlocker: number;
  topFoul: number;
  topTurnover: number;
  basePath?: string;
  seasons?: SeasonInfo[];
  currentSeason?: string;
}

function getMemberKey(member: PlayerListEntry): string {
  return member.number !== null ? `#${member.number}` : getRoleLabel(member.role);
}

export default function PlayerCards({ members, topScorer, topRebounder, topAssister, top3P, topStealer, topBlocker, topFoul, topTurnover, basePath = "", seasons, currentSeason }: PlayerCardsProps) {
  const players = members.filter((m) => !isStaffRole(m.role));
  const staff = members.filter((m) => isStaffRole(m.role));

  return (
    <AnimatedSection id="members" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="font-display text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center uppercase tracking-wider">
        Team <span className="text-accent-purple">Members</span>
      </h2>
      <div className="court-divider mb-6 sm:mb-8" aria-hidden="true" />
      {seasons && currentSeason ? (
        <SeasonSwitcher seasons={seasons} currentSeason={currentSeason} pageType="members" />
      ) : null}

      {/* Players */}
      <h3 className="font-display text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center uppercase tracking-wider text-neutral-400">
        <span className="text-accent-purple">Players</span>
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {players.map((p, i) => (
          <AnimatedSection key={p.memberId} delay={i * 0.04}>
            <Link href={`${basePath}/member/${p.memberId}`} className="block h-full rounded-lg">
              <GlassCard hover className="cursor-pointer h-full flex flex-col">
                <div>
                  <div className="stat-number text-2xl sm:text-4xl text-accent-purple/30">{getMemberKey(p)}</div>
                  <div className="text-sm sm:text-lg font-semibold mt-0.5 sm:mt-1">{p.name}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-600">
                    {p.summary ? `${p.summary.games} games played` : "Season DNP"}
                  </div>
                  {p.summary && p.number !== null && (p.number === topScorer || p.number === topRebounder || p.number === topAssister || p.number === top3P || p.number === topStealer || p.number === topBlocker || p.number === topFoul || p.number === topTurnover) ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.number === topScorer ? <Badge variant="purple">Top Scorer</Badge> : null}
                      {p.number === topRebounder ? <Badge variant="blue">Top Rebounder</Badge> : null}
                      {p.number === topAssister ? <Badge variant="green">Top Assists</Badge> : null}
                      {p.number === top3P ? <Badge variant="pink">Top 3P</Badge> : null}
                      {p.number === topStealer ? <Badge variant="cyan">Top Steals</Badge> : null}
                      {p.number === topBlocker ? <Badge variant="yellow">Top Blocks</Badge> : null}
                      {p.number === topFoul ? <Badge variant="red">Top Fouls</Badge> : null}
                      {p.number === topTurnover ? <Badge variant="orange">Top Turnovers</Badge> : null}
                    </div>
                  ) : null}
                </div>

                {p.summary ? (
                  <>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-4 text-center mt-auto pt-2 sm:pt-4">
                      <div>
                        <div className="stat-number text-base sm:text-xl text-accent-purple">{p.summary.ppg}</div>
                        <div className="text-[10px] sm:text-xs text-neutral-600 font-display uppercase tracking-wider">PPG</div>
                      </div>
                      <div>
                        <div className="stat-number text-base sm:text-xl">{(p.summary.totalReb / p.summary.games).toFixed(1)}</div>
                        <div className="text-[10px] sm:text-xs text-neutral-600 font-display uppercase tracking-wider">RPG</div>
                      </div>
                      <div>
                        <div className="stat-number text-base sm:text-xl">{(p.summary.assists / p.summary.games).toFixed(1)}</div>
                        <div className="text-[10px] sm:text-xs text-neutral-600 font-display uppercase tracking-wider">APG</div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 sm:gap-6">
                      <ProgressRing percentage={p.summary.threePointPct} size={40} strokeWidth={3} color={shootingColors.threePoint} label="3P%" />
                      <ProgressRing percentage={p.summary.twoPointPct} size={40} strokeWidth={3} color={shootingColors.twoPoint} label="2P%" />
                      <ProgressRing percentage={p.summary.ftPct} size={40} strokeWidth={3} color={shootingColors.freeThrow} label="FT%" />
                    </div>
                  </>
                ) : (
                  <div className="mt-auto pt-6 text-center text-xs sm:text-sm text-neutral-700">
                    Season DNP
                  </div>
                )}
              </GlassCard>
            </Link>
          </AnimatedSection>
        ))}
      </div>

      {/* Staff */}
      {staff.length > 0 ? (
        <>
          <h3 className="font-display text-lg sm:text-xl font-bold mt-10 sm:mt-14 mb-4 sm:mb-6 text-center uppercase tracking-wider text-neutral-400">
            Coaching <span className="text-accent-purple">Staff</span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {staff.map((p, i) => (
              <AnimatedSection key={p.memberId} delay={i * 0.04}>
                <Link href={`${basePath}/member/${p.memberId}`} className="block h-full rounded-lg">
                  <GlassCard hover className="cursor-pointer h-full flex flex-col">
                    <div>
                      <div className="stat-number text-base sm:text-2xl text-accent-purple/30">{getRoleLabel(p.role)}</div>
                      <div className="text-sm sm:text-lg font-semibold mt-0.5 sm:mt-1">{p.name}</div>
                    </div>
                    <div className="mt-auto pt-6 text-center text-xs sm:text-sm text-neutral-700">
                      {getRoleLabel(p.role)}
                    </div>
                  </GlassCard>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </>
      ) : null}
    </AnimatedSection>
  );
}
