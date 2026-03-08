"use client";

import { motion, useReducedMotion } from "framer-motion";
import StatCounter from "../ui/StatCounter";

interface HeroProps {
  seasonLabel: string;
  totalPoints: number;
  totalGames: number;
  totalPlayers: number;
}

export default function HeroSection({ seasonLabel, totalPoints, totalGames, totalPlayers }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  return (
    <section className="relative min-h-[50vh] sm:min-h-[70vh] flex items-center justify-center gradient-mesh overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[#0a0a0f]/40" />
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8 }}
        >
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-purple/30 bg-[#0f1020]/70 text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-accent-purple uppercase mb-5">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-purple" aria-hidden="true" />
            <span>{seasonLabel} Season</span>
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-wider mb-4 [text-wrap:balance]">
            <span className="text-accent-purple">E</span>SPOIR
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-8 sm:mb-12 tracking-wide">
            BASKETBALL TEAM STATS
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-6 sm:gap-16"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-purple">
              <StatCounter end={totalPoints} />
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 mt-1">TOTAL PTS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-purple-light">
              <StatCounter end={totalGames} />
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 mt-1">GAMES</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              <StatCounter end={totalPlayers} />
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 mt-1">PLAYERS</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
