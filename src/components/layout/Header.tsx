"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#overview", label: "Overview", isPage: false },
  { href: "/players", label: "Players", isPage: true },
  { href: "#games", label: "Games", isPage: false },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
          <span className="text-accent-purple">E</span>SPOIR
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-400" aria-label="メインナビゲーション">
          {navLinks.map((link) =>
            link.isPage ? (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded">
                {link.label}
              </a>
            )
          )}
        </nav>
        <button
          className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="sm:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/5" aria-label="モバイルナビゲーション">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) =>
              link.isPage ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-neutral-400 hover:text-white transition-colors py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple rounded"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
