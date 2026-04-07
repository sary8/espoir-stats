"use client";

import Link from "next/link";
import type { SeasonInfo } from "@/lib/types";

interface SeasonSwitcherProps {
  seasons: SeasonInfo[];
  currentSeason: string;
  pageType: "games" | "members";
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
            aria-current={isActive ? "page" : undefined}
            className={`px-4 py-2 rounded-md text-sm font-semibold font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple ${
              isActive
                ? "bg-accent-purple text-black"
                : "bg-white/5 text-neutral-500 hover:bg-white/8 hover:text-neutral-300"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
