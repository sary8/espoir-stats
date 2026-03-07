"use client";

import Link from "next/link";
import type { SeasonInfo } from "@/lib/types";

interface SeasonSwitcherProps {
  seasons: SeasonInfo[];
  currentSeason: string;
  pageType: "games" | "players";
}

export default function SeasonSwitcher({ seasons, currentSeason, pageType }: SeasonSwitcherProps) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {seasons.map((s) => {
        const isActive = s.id === currentSeason;
        const href = `/season/${s.id}/${pageType}`;
        return (
          <Link
            key={s.id}
            href={href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent-purple text-white"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
