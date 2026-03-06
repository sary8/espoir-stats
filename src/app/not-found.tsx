"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  return (
    <main className="min-h-screen flex items-center justify-center gradient-mesh overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]/40" />
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.8 }}
        >
          <p className="text-accent-purple text-lg sm:text-xl font-semibold tracking-widest mb-4">
            404
          </p>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-wider mb-6">
            <span className="text-accent-purple">N</span>OT
            <br />
            <span className="text-accent-purple">F</span>OUND
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg mb-10">
            お探しのページは見つかりませんでした
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10 transition-colors duration-300 font-medium"
          >
            ホームに戻る
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
