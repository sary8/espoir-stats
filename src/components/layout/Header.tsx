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
const ROOT_ONLY_PATHS = ["/compare", "/seasons", "/all-time", "/glossary", "/login"];

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
    const isRootOnly = ROOT_ONLY_PATHS.some((p) => subPath === p);
    const safeSub = isRootOnly ? "/" : subPath;
    const newPath = season.default ? safeSub || "/" : `/season/${season.id}${safeSub}`;
    router.push(newPath);
    setSeasonOpen(false);
  };

  const navLinks = [
    { href: `${basePath}/`, label: "Top", exact: true },
    { href: `${basePath}/members`, label: "Members", exact: false },
    { href: `${basePath}/games`, label: "Games", exact: false },
    { href: "/compare", label: "Compare", exact: true },
    { href: "/seasons", label: "Seasons", exact: true },
    { href: "/all-time", label: "All-Time", exact: true },
    { href: `${basePath}/player-compare`, label: "Player Compare", exact: false },
    { href: "/glossary", label: "Stats Guide", exact: true },
  ];

  const isActive = (link: { href: string; exact: boolean }) => {
    const norm = (s: string) => (s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s);
    return link.exact
      ? norm(pathname) === norm(link.href)
      : pathname.startsWith(link.href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-[#06060c]/95 backdrop-blur-sm border-b border-accent-purple/5"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href={`${basePath}/`} className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-[0.15em] uppercase">
            <span className="text-accent-purple">E</span><span className="text-foreground">SPOIR</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="メインナビゲーション">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-1.5 rounded-md font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple ${
                  active
                    ? "text-accent-purple bg-accent-purple/8"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {seasons && seasons.length > 1 ? (
            <div className="relative ml-2" ref={seasonRef}>
              <button
                type="button"
                onClick={() => setSeasonOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-purple/10 border border-accent-purple/15 hover:bg-accent-purple/15 transition-colors text-xs font-semibold font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider text-accent-purple cursor-pointer"
                aria-expanded={seasonOpen}
                aria-label="シーズン切替"
              >
                {currentSeason?.label ?? "Season"}
                <ChevronDown size={12} className={`transition-transform ${seasonOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {seasonOpen ? (
                <div className="absolute right-0 mt-2 w-40 bg-surface-bright border border-accent-purple/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSeasonChange(s)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider transition-colors cursor-pointer ${
                        currentSeason?.id === s.id
                          ? "bg-accent-purple/15 text-accent-purple"
                          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
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
          className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-accent-purple transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      {menuOpen ? (
        <nav className="sm:hidden bg-[#06060c]/98 backdrop-blur-sm border-t border-accent-purple/5" aria-label="モバイルナビゲーション">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-2.5 rounded-md text-sm font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple ${
                    active
                      ? "text-accent-purple bg-accent-purple/8"
                      : "text-neutral-500 hover:text-neutral-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {seasons && seasons.length > 1 ? (
              <div className="border-t border-accent-purple/5 pt-3 mt-2">
                <p className="text-[10px] text-neutral-600 mb-2 px-3 uppercase tracking-widest font-[family-name:var(--font-barlow-condensed)]">Season</p>
                <div className="flex flex-col gap-1">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        handleSeasonChange(s);
                        setMenuOpen(false);
                      }}
                      className={`text-left py-2 px-3 rounded-md text-sm font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider font-semibold cursor-pointer ${
                        currentSeason?.id === s.id
                          ? "bg-accent-purple/15 text-accent-purple"
                          : "text-neutral-500 hover:bg-white/5"
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
