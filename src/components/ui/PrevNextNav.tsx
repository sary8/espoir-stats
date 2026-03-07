"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  sublabel?: string;
}

interface PrevNextNavProps {
  prev: NavItem | null;
  next: NavItem | null;
}

export default function PrevNextNav({ prev, next }: PrevNextNavProps) {
  return (
    <div className="flex justify-between items-stretch gap-3 mt-12">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors min-w-0 max-w-[48%]"
        >
          <ChevronLeft size={16} className="text-neutral-400 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Prev</p>
            <p className="text-sm font-bold truncate">{prev.label}</p>
            {prev.sublabel && <p className="text-xs text-neutral-400 truncate">{prev.sublabel}</p>}
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors min-w-0 max-w-[48%] ml-auto text-right"
        >
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Next</p>
            <p className="text-sm font-bold truncate">{next.label}</p>
            {next.sublabel && <p className="text-xs text-neutral-400 truncate">{next.sublabel}</p>}
          </div>
          <ChevronRight size={16} className="text-neutral-400 shrink-0" aria-hidden="true" />
        </Link>
      ) : <div />}
    </div>
  );
}
