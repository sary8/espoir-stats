"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import type { SeasonInfo } from "@/lib/types";

interface HeaderProps {
  seasons?: SeasonInfo[];
}

const SEASON_PATH_RE = /^\/season\/([^/]+)/;

function getSeasonFromPath(pathname: string): string | null {
  const match = pathname.match(SEASON_PATH_RE);
  return match ? match[1] : null;
}

function getBasePath(pathname: string): string {
  const seasonId = getSeasonFromPath(pathname);
  return seasonId ? `/season/${seasonId}` : "";
}

export default function Header({ seasons }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const scrolledRef = useRef(false);
  const seasonRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const basePath = getBasePath(pathname);
  const currentSeasonId = getSeasonFromPath(pathname);
  const defaultSeason = seasons?.find((s) => s.default);
  const currentSeason = currentSeasonId
    ? seasons?.find((s) => s.id === currentSeasonId)
    : defaultSeason;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (scrolledRef.current !== isScrolled) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!seasonOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) {
        setSeasonOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSeasonOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [seasonOpen]);

  const handleSeasonChange = (season: SeasonInfo) => {
    const subPath = currentSeasonId
      ? pathname.replace(`/season/${currentSeasonId}`, "")
      : pathname;
    const newPath = season.default ? subPath || "/" : `/season/${season.id}${subPath}`;
    router.push(newPath);
    setSeasonOpen(false);
  };

  const navLinks = [
    { href: `${basePath}/`, label: "Top" },
    { href: `${basePath}/members`, label: "Members" },
    { href: `${basePath}/games`, label: "Games" },
    { href: "/compare", label: "Compare" },
    { href: "/glossary", label: "Stats Guide" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || menuOpen ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href={`${basePath}/`} className="text-xl font-bold tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
          <span className="text-accent-purple">E</span>SPOIR
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-400" aria-label="メインナビゲーション">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
            >
              {link.label}
            </Link>
          ))}
          {seasons && seasons.length > 1 ? (
            <div className="relative" ref={seasonRef}>
              <button
                type="button"
                onClick={() => setSeasonOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-neutral-300 cursor-pointer"
                aria-expanded={seasonOpen}
                aria-label="シーズン切替"
              >
                {currentSeason?.label ?? "Season"}
                <ChevronDown size={14} className={`transition-transform ${seasonOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {seasonOpen ? (
                <div className="absolute right-0 mt-2 w-40 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSeasonChange(s)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        currentSeason?.id === s.id
                          ? "bg-accent-purple/20 text-accent-purple font-medium"
                          : "text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>
        <button
          className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      {menuOpen ? (
        <nav className="sm:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/5" aria-label="モバイルナビゲーション">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
              >
                {link.label}
              </Link>
            ))}
            {seasons && seasons.length > 1 ? (
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-neutral-500 mb-2">Season</p>
                <div className="flex flex-col gap-1">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        handleSeasonChange(s);
                        setMenuOpen(false);
                      }}
                      className={`text-left py-2 px-3 rounded-lg text-sm cursor-pointer ${
                        currentSeason?.id === s.id
                          ? "bg-accent-purple/20 text-accent-purple font-medium"
                          : "text-neutral-400 hover:bg-white/5"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
