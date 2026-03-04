"use client";

import { motion, useReducedMotion } from "framer-motion";
import StatCounter from "../ui/StatCounter";

interface HeroProps {
  totalPoints: number;
  totalGames: number;
  totalPlayers: number;
}

export default function HeroSection({ totalPoints, totalGames, totalPlayers }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center gradient-mesh overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[#0a0a0f]/40" />
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8 }}
        >
          <h1 className="text-7xl sm:text-9xl font-bold tracking-wider mb-4">
            <span className="text-accent-orange">E</span>SPOIR
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 mb-12 tracking-wide">
            BASKETBALL TEAM STATS
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-8 sm:gap-16"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-accent-orange">
              <StatCounter end={totalPoints} />
            </div>
            <div className="text-sm text-neutral-400 mt-1">TOTAL PTS</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-accent-blue">
              <StatCounter end={totalGames} />
            </div>
            <div className="text-sm text-neutral-400 mt-1">GAMES</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-white">
              <StatCounter end={totalPlayers} />
            </div>
            <div className="text-sm text-neutral-400 mt-1">PLAYERS</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
