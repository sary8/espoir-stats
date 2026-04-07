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
    <footer className="border-t border-accent-purple/5 py-8 text-center text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isHome ? (
          <nav className="flex justify-center gap-6 mb-4 font-display uppercase tracking-wider text-xs font-semibold" aria-label="フッターナビゲーション">
            <a href="#overview" className="text-neutral-600 hover:text-accent-purple transition-colors rounded">Overview</a>
            <Link href={`${basePath}/members`} className="text-neutral-600 hover:text-accent-purple transition-colors rounded">Members</Link>
            <Link href={`${basePath}/games`} className="text-neutral-600 hover:text-accent-purple transition-colors rounded">Games</Link>
          </nav>
        ) : (
          <div className="mb-4">
            <Link href={`${basePath}/`} className="inline-flex items-center gap-2 text-neutral-600 hover:text-accent-purple transition-colors rounded text-sm">
              <ArrowLeft size={14} aria-hidden="true" /> Back to Top
            </Link>
          </div>
        )}
        <p className="text-xs text-neutral-600">
          <span className="font-display font-bold tracking-wider uppercase gradient-text">ESPOIR</span>
          <span className="mx-2 text-neutral-700">|</span>
          Stats Dashboard
        </p>
        {seasonLabel ? <p className="mt-1 text-xs text-neutral-700">Season {seasonLabel}</p> : null}
      </div>
    </footer>
  );
}
