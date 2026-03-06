"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isHome ? (
          <nav className="flex justify-center gap-6 mb-4" aria-label="フッターナビゲーション">
            <a href="#overview" className="hover:text-white transition-colors rounded">Overview</a>
            <a href="#players" className="hover:text-white transition-colors rounded">Players</a>
            <a href="#games" className="hover:text-white transition-colors rounded">Games</a>
          </nav>
        ) : (
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-2 hover:text-white transition-colors rounded">
              <ArrowLeft size={16} aria-hidden="true" /> Back to Top
            </Link>
          </div>
        )}
        <p className="text-xs sm:text-sm"><span className="text-accent-purple font-semibold">ESPOIR</span> Stats Dashboard</p>
        <p className="mt-1 text-xs sm:text-sm">Season 2025-2026</p>
      </div>
    </footer>
  );
}
