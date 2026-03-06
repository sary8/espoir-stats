"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolledRef = useRef(false);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || menuOpen ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
          <span className="text-accent-purple">E</span>SPOIR
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-400" aria-label="メインナビゲーション">
          <Link href="/" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
            Top
          </Link>
          <Link href="/players" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
            Players
          </Link>
          <Link href="/games" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
            Games
          </Link>
          <Link href="/glossary" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
            Stats Guide
          </Link>
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
      {menuOpen && (
        <nav className="sm:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/5" aria-label="モバイルナビゲーション">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
            >
              Top
            </Link>
            <Link
              href="/players"
              onClick={() => setMenuOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
            >
              Players
            </Link>
            <Link
              href="/games"
              onClick={() => setMenuOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
            >
              Games
            </Link>
            <Link
              href="/glossary"
              onClick={() => setMenuOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
            >
              Stats Guide
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
