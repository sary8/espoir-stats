"use client";

import { useRouter } from "next/navigation";
import { Youtube } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameResult } from "@/lib/types";

interface GameListProps {
  games: GameResult[];
}

export default function GameList({ games }: GameListProps) {
  const router = useRouter();

  return (
    <AnimatedSection className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Game <span className="text-accent-purple">Results</span>
      </h1>
      <div className="grid gap-4 sm:gap-6">
        {games.map((game, i) => (
          <AnimatedSection key={game.opponent} delay={Math.min(i * 0.1, 0.5)}>
            <div
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/games/${encodeURIComponent(game.opponent)}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/games/${encodeURIComponent(game.opponent)}`);
                }
              }}
              className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
            >
              <GlassCard hover className="cursor-pointer">
                <div className="flex flex-col items-center text-center gap-1">
                  <p className="text-xs sm:text-sm text-neutral-400">
                    {game.date.replace(/-/g, "/")}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-5">
                    <span className="text-lg sm:text-xl font-bold">Espoir</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-accent-purple">
                        {game.teamPoints}
                      </span>
                      <span className="text-neutral-400 text-sm">-</span>
                      <span className="text-2xl sm:text-3xl font-bold text-neutral-300">
                        {game.opponentPoints}
                      </span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold">{game.opponent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {game.teamPoints > game.opponentPoints ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">WIN</span>
                    ) : game.teamPoints < game.opponentPoints ? (
                      <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">LOSE</span>
                    ) : (
                      <span className="text-xs font-semibold text-neutral-400 bg-neutral-400/10 px-2 py-0.5 rounded">DRAW</span>
                    )}
                    {game.youtubeUrl && (
                      <a
                        href={game.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${game.opponent}戦の試合動画`}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Youtube size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  );
}
