"use client";

import { useRouter } from "next/navigation";
import { Youtube } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameResult } from "@/lib/types";

interface GameListProps {
  games: GameResult[];
}

function ResultBadge({ team, opponent }: { team: number; opponent: number }) {
  if (team > opponent) {
    return <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase">Win</span>;
  }
  if (team < opponent) {
    return <span className="text-[10px] font-bold tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full uppercase">Lose</span>;
  }
  return <span className="text-[10px] font-bold tracking-wider text-neutral-400 bg-neutral-400/10 px-2 py-0.5 rounded-full uppercase">Draw</span>;
}

export default function GameList({ games }: GameListProps) {
  const router = useRouter();

  return (
    <AnimatedSection className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center">
        Game <span className="text-accent-purple">Results</span>
      </h1>
      <div className="grid gap-3">
        {games.map((game, i) => (
          <AnimatedSection key={game.opponent} delay={Math.min(i * 0.08, 0.4)}>
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
              <GlassCard hover className="cursor-pointer !py-4 !px-5 sm:!py-5 sm:!px-6">
                <div className="flex items-center">
                  {/* 左: バッジ + 日付 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ResultBadge team={game.teamPoints} opponent={game.opponentPoints} />
                    <p className="text-xs text-neutral-500 hidden sm:block">{game.date.replace(/-/g, "/")}</p>
                  </div>

                  {/* 中央: スコア（flex-1で残りを占め、内部で中央揃え） */}
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-semibold text-neutral-300 w-16 sm:w-20 text-right shrink-0">Espoir</span>
                    <span className="w-10 sm:w-12 text-right text-2xl sm:text-3xl font-bold tabular-nums text-accent-purple shrink-0">
                      {game.teamPoints}
                    </span>
                    <span className="w-5 text-center text-neutral-600 text-xs shrink-0">–</span>
                    <span className="w-10 sm:w-12 text-left text-2xl sm:text-3xl font-bold tabular-nums text-neutral-300 shrink-0">
                      {game.opponentPoints}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-neutral-300 w-16 sm:w-20 shrink-0">{game.opponent}</span>
                  </div>

                  {/* 右: YouTube */}
                  <div className="shrink-0">
                    {game.youtubeUrl ? (
                      <a
                        href={game.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${game.opponent}戦の試合動画`}
                        className="p-2 rounded-full text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Youtube size={18} />
                      </a>
                    ) : (
                      <div className="w-[34px]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-600 text-center mt-1 sm:hidden">{game.date.replace(/-/g, "/")}</p>
              </GlassCard>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  );
}
