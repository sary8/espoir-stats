"use client";

import Link from "next/link";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import SeasonSwitcher from "../ui/SeasonSwitcher";
import type { GameResult, SeasonInfo } from "@/lib/types";

interface GameListProps {
  games: GameResult[];
  basePath?: string;
  seasons?: SeasonInfo[];
  currentSeason?: string;
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return dateFormatter.format(new Date(y, m - 1, d));
}

type Result = "win" | "lose" | "draw";

function getResult(team: number, opponent: number): Result {
  if (team > opponent) return "win";
  if (team < opponent) return "lose";
  return "draw";
}

const resultConfig = {
  win: {
    badge: "WIN",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/15",
    borderClass: "!border-l-emerald-500/50",
    scoreClass: "text-emerald-400",
  },
  lose: {
    badge: "LOSE",
    badgeClass: "text-red-400 bg-red-500/10 border border-red-500/15",
    borderClass: "!border-l-red-500/50",
    scoreClass: "text-red-400",
  },
  draw: {
    badge: "DRAW",
    badgeClass: "text-neutral-400 bg-neutral-500/10 border border-neutral-500/15",
    borderClass: "!border-l-neutral-500/50",
    scoreClass: "text-neutral-400",
  },
} as const;

export default function GameList({ games, basePath = "", seasons, currentSeason }: GameListProps) {
  return (
    <AnimatedSection className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-display text-2xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center uppercase tracking-wider">
        Game <span className="text-accent-purple">Results</span>
      </h1>
      <div className="court-divider mb-6 sm:mb-8" aria-hidden="true" />
      {seasons && currentSeason ? (
        <SeasonSwitcher seasons={seasons} currentSeason={currentSeason} pageType="games" />
      ) : null}
      <div className="grid gap-2">
        {games.map((game, i) => {
          const result = getResult(game.teamPoints, game.opponentPoints);
          const config = resultConfig[result];

          return (
            <AnimatedSection key={game.gameId} delay={Math.min(i * 0.06, 0.4)}>
              <GlassCard hover className={`!py-3 !px-4 sm:!py-4 sm:!px-5 border-l-[3px] ${config.borderClass}`}>
                <Link
                  href={`${basePath}/games/${encodeURIComponent(game.gameId)}`}
                  className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple touch-manipulation"
                >
                  <div className="grid grid-cols-[1fr_20px_1fr] items-center">
                    <div className="flex items-center">
                      <span className={`text-[10px] font-bold font-display tracking-wider px-2 py-0.5 rounded shrink-0 ${config.badgeClass}`}>
                        {config.badge}
                      </span>
                      <p className="text-[10px] text-neutral-600 tabular-nums hidden sm:block shrink-0 ml-2.5">{formatDate(game.date)}</p>
                      <div className="flex items-center ml-auto">
                        <span className="text-xs sm:text-sm font-display font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap">Espoir</span>
                        <span className={`w-10 sm:w-12 text-right stat-number text-2xl sm:text-3xl shrink-0 ${config.scoreClass}`}>
                          {game.teamPoints}
                        </span>
                      </div>
                    </div>
                    <span className="text-center text-neutral-700 text-xs">-</span>
                    <div className="flex items-center">
                      <span className="w-10 sm:w-12 text-left stat-number text-2xl sm:text-3xl text-neutral-400 shrink-0">
                        {game.opponentPoints}
                      </span>
                      <span className="text-xs sm:text-sm font-display font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap">{game.opponent}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-700 text-center mt-1 tabular-nums sm:hidden">{formatDate(game.date)}</p>
                </Link>
              </GlassCard>
            </AnimatedSection>
          );
        })}
      </div>
    </AnimatedSection>
  );
}
