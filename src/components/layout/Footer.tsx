"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FooterProps {
  seasonLabel?: string;
}

const SEASON_PATH_RE = /^\/season\/([^/]+)/;

function getBasePath(pathname: string): string {
  const match = pathname.match(SEASON_PATH_RE);
  return match ? `/season/${match[1]}` : "";
}

export default function Footer({ seasonLabel }: FooterProps) {
  const pathname = usePathname();
  const basePath = getBasePath(pathname);
  const isHome = pathname === "/" || pathname === basePath || pathname === `${basePath}/`;

  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isHome ? (
          <nav className="flex justify-center gap-6 mb-4" aria-label="フッターナビゲーション">
            <a href="#overview" className="hover:text-white transition-colors rounded">Overview</a>
            <Link href={`${basePath}/members`} className="hover:text-white transition-colors rounded">Members</Link>
            <Link href={`${basePath}/games`} className="hover:text-white transition-colors rounded">Games</Link>
          </nav>
        ) : (
          <div className="mb-4">
            <Link href={`${basePath}/`} className="inline-flex items-center gap-2 hover:text-white transition-colors rounded">
              <ArrowLeft size={16} aria-hidden="true" /> Back to Top
            </Link>
          </div>
        )}
        <p className="text-xs sm:text-sm"><span className="text-accent-purple font-semibold">ESPOIR</span> Stats Dashboard</p>
        {seasonLabel ? <p className="mt-1 text-xs sm:text-sm">Season {seasonLabel}</p> : null}
      </div>
    </footer>
  );
}
