"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  return (
    <main className="min-h-screen flex items-center justify-center gradient-mesh court-pattern overflow-hidden">
      <div className="absolute inset-0 bg-background/50" />
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8 }}
        >
          <p className="font-display text-accent-purple text-lg sm:text-xl font-bold tracking-[0.3em] uppercase mb-4">
            404
          </p>
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl font-bold tracking-[0.1em] uppercase mb-6 leading-tight">
            <span className="text-accent-purple">N</span>OT
            <br />
            <span className="text-accent-purple">F</span>OUND
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base mb-10">
            お探しのページは見つかりませんでした
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent-purple/20 text-accent-purple hover:bg-accent-purple/5 transition-colors duration-300 font-display font-bold uppercase tracking-wider text-sm"
          >
            ホームに戻る
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
