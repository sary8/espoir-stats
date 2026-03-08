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
    badgeClass: "text-emerald-400 bg-emerald-400/15 ring-1 ring-emerald-400/20",
    borderClass: "border-l-emerald-500",
    scoreClass: "text-emerald-400",
  },
  lose: {
    badge: "LOSE",
    badgeClass: "text-red-400 bg-red-400/15 ring-1 ring-red-400/20",
    borderClass: "border-l-red-500",
    scoreClass: "text-red-400",
  },
  draw: {
    badge: "DRAW",
    badgeClass: "text-neutral-400 bg-neutral-400/15 ring-1 ring-neutral-400/20",
    borderClass: "border-l-neutral-500",
    scoreClass: "text-neutral-400",
  },
} as const;

export default function GameList({ games, basePath = "", seasons, currentSeason }: GameListProps) {
  return (
    <AnimatedSection className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center [text-wrap:balance]">
        Game <span className="text-accent-purple">Results</span>
      </h1>
      {seasons && currentSeason ? (
        <SeasonSwitcher seasons={seasons} currentSeason={currentSeason} pageType="games" />
      ) : null}
      <div className="grid gap-3">
        {games.map((game, i) => {
          const result = getResult(game.teamPoints, game.opponentPoints);
          const config = resultConfig[result];

          return (
            <AnimatedSection key={game.gameId} delay={Math.min(i * 0.08, 0.4)}>
              <GlassCard hover className={`!py-4 !px-5 sm:!py-5 sm:!px-6 border-l-[3px] ${config.borderClass}`}>
                <Link
                  href={`${basePath}/games/${encodeURIComponent(game.gameId)}`}
                  className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple touch-manipulation"
                >
                  <div className="grid grid-cols-[1fr_20px_1fr] items-center">
                    <div className="flex items-center">
                      <span className={`text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${config.badgeClass}`}>
                        {config.badge}
                      </span>
                      <p className="text-xs text-neutral-500 tabular-nums hidden sm:block shrink-0 ml-2.5">{formatDate(game.date)}</p>
                      <div className="flex items-center ml-auto">
                        <span className="text-xs sm:text-base font-semibold text-neutral-300 whitespace-nowrap">Espoir</span>
                        <span className={`w-10 sm:w-12 text-right text-2xl sm:text-3xl font-bold tabular-nums shrink-0 ${config.scoreClass}`}>
                          {game.teamPoints}
                        </span>
                      </div>
                    </div>
                    <span className="text-center text-neutral-600 text-xs">–</span>
                    <div className="flex items-center">
                      <span className="w-10 sm:w-12 text-left text-2xl sm:text-3xl font-bold tabular-nums text-neutral-300 shrink-0">
                        {game.opponentPoints}
                      </span>
                      <span className="text-xs sm:text-base font-semibold text-neutral-300 whitespace-nowrap">{game.opponent}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-600 text-center mt-1 tabular-nums sm:hidden">{formatDate(game.date)}</p>
                </Link>
              </GlassCard>
            </AnimatedSection>
          );
        })}
      </div>
    </AnimatedSection>
  );
}
