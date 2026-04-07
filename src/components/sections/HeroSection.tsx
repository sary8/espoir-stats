"use client";

import { motion, useReducedMotion } from "framer-motion";
import StatCounter from "../ui/StatCounter";

interface HeroProps {
  seasonLabel: string;
  totalPoints: number;
  totalGames: number;
  totalMembers: number;
}

export default function HeroSection({ seasonLabel, totalPoints, totalGames, totalMembers }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  return (
    <section className="relative min-h-[50vh] sm:min-h-[70vh] flex items-center justify-center gradient-mesh court-pattern overflow-hidden pt-16">
      <div className="absolute inset-0 bg-background/40" />

      {/* Decorative court circles — purple + gold rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full border border-accent-purple/[0.06]" />
        <div className="absolute w-[200px] h-[200px] sm:w-[340px] sm:h-[340px] rounded-full border border-accent-gold/[0.04]" />
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8 }}
        >
          <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent-gold/20 bg-accent-gold/5 text-[10px] sm:text-xs font-bold tracking-[0.3em] text-accent-gold uppercase mb-6 font-display">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-gold" aria-hidden="true" />
            <span>{seasonLabel} Season</span>
          </p>
          <h1 className="font-display text-6xl sm:text-8xl md:text-[10rem] font-bold tracking-[0.1em] uppercase mb-3 leading-none">
            <span className="gradient-text">ESPOIR</span>
          </h1>
          <p className="font-display text-sm sm:text-base md:text-lg text-neutral-500 tracking-[0.35em] uppercase mb-10 sm:mb-14">
            Basketball Stats
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-10 sm:gap-20"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8, delay: 0.3 }}
        >
          {[
            { value: totalPoints, label: "TOTAL PTS", glow: "neon-purple", color: "text-accent-purple" },
            { value: totalGames, label: "GAMES", glow: "neon-gold", color: "text-accent-gold" },
            { value: totalMembers, label: "MEMBERS", glow: "", color: "text-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`font-display text-4xl sm:text-5xl md:text-6xl font-bold ${stat.color} ${stat.glow}`}>
                <StatCounter end={stat.value} />
              </div>
              <div className="font-display text-[10px] sm:text-xs text-neutral-600 mt-2 tracking-[0.25em] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
