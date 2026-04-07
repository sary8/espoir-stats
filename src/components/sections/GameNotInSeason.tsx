"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import type { SeasonInfo } from "@/lib/types";

interface GameNotInSeasonProps {
  opponent: string;
  seasonLabel: string;
  seasons: SeasonInfo[];
  basePath?: string;
  gameSeasonIds?: string[];
}

export default function GameNotInSeason({ opponent, seasonLabel, seasons, basePath = "", gameSeasonIds }: GameNotInSeasonProps) {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  const gameSeasons = gameSeasonIds
    ? seasons.filter((s) => gameSeasonIds.includes(s.id))
    : [];

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <section className="min-h-[calc(100vh-8rem)] flex items-center justify-center gradient-mesh">
          <div className="absolute inset-0 bg-[#06060c]/40" />
          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? noMotion : { duration: 0.6 }}
            >
              <p className="text-5xl sm:text-7xl font-bold text-accent-purple/20 mb-2">vs {opponent}</p>
              <p className="text-lg sm:text-xl text-neutral-300 mb-2">
                この試合は <span className="text-accent-purple font-semibold">{seasonLabel}</span> シーズンには存在しません
              </p>
              <p className="text-sm text-neutral-500 mb-8">
                別のシーズンに切り替えるか、試合一覧から探してください
              </p>
              {gameSeasons.length > 0 ? (
                <div className="mb-8">
                  <p className="text-sm text-neutral-400 mb-3">この試合があるシーズン:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {gameSeasons.map((s) => (
                      <Link
                        key={s.id}
                        href={`/season/${s.id}/games`}
                        className="px-4 py-2 rounded-full border border-accent-purple/40 text-accent-purple hover:bg-accent-purple/10 transition-colors text-sm font-medium"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              <Link
                href={`${basePath}/games`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10 transition-colors duration-300 font-medium"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                試合一覧に戻る
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
