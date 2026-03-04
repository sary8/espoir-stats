"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wider">
          <span className="text-accent-orange">E</span>SPOIR
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-400">
          <a href="#overview" className="hover:text-white transition-colors">Overview</a>
          <a href="#players" className="hover:text-white transition-colors">Players</a>
          <a href="#games" className="hover:text-white transition-colors">Games</a>
        </nav>
      </div>
    </header>
  );
}
