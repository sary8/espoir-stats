"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Youtube, ArrowLeft } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameResult, GamePlayerStat } from "@/lib/types";

function fmtPct(made: number, attempt: number): string {
  if (attempt === 0) return "-";
  return `${((made / attempt) * 100).toFixed(1)}%`;
}

function pctVal(made: number, attempt: number): number {
  if (attempt === 0) return -1;
  return (made / attempt) * 100;
}

function parseMinutes(min: string): number {
  if (!min) return 0;
  const parts = min.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}

function formatMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type SortKey =
  | "number" | "points"
  | "threePointMade" | "threePointPct" | "twoPointMade" | "twoPointPct"
  | "ftMade" | "ftPct"
  | "offReb" | "defReb" | "totalReb"
  | "assists" | "steals" | "blocks" | "turnovers"
  | "personalFouls" | "foulsDrawn";

const TH_SORTABLE = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors";

function SortTh({ k, sortKey, sortAsc, onSort, children }: {
  k: SortKey;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (k: SortKey) => void;
  children: React.ReactNode;
}) {
  const isActive = sortKey === k;
  return (
    <th className={TH_SORTABLE} scope="col" onClick={() => onSort(k)}>
      <span className="inline-flex items-center gap-0.5">
        {children}
        {isActive
          ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
          : <ChevronDown size={10} className="opacity-30" />}
      </span>
    </th>
  );
}

interface GameDetailClientProps {
  game: GameResult;
}

export default function GameDetailClient({ game }: GameDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"espoir" | "opponent">("espoir");
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortAsc, setSortAsc] = useState(true);

  const players = activeTab === "espoir" ? game.players : game.opponentPlayers;

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "threePointPct") {
        va = pctVal(a.threePointMade, a.threePointAttempt);
        vb = pctVal(b.threePointMade, b.threePointAttempt);
      } else if (sortKey === "twoPointPct") {
        va = pctVal(a.twoPointMade, a.twoPointAttempt);
        vb = pctVal(b.twoPointMade, b.twoPointAttempt);
      } else if (sortKey === "ftPct") {
        va = pctVal(a.ftMade, a.ftAttempt);
        vb = pctVal(b.ftMade, b.ftAttempt);
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      return sortAsc ? va - vb : vb - va;
    });
  }, [players, sortKey, sortAsc]);

  const teamTotals = useMemo(() => {
    const t = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 0, totalReb: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, personalFouls: 0, foulsDrawn: 0, points: 0, totalMinutes: 0 };
    for (const p of players) {
      t.points += p.points;
      t.threePointMade += p.threePointMade;
      t.threePointAttempt += p.threePointAttempt;
      t.twoPointMade += p.twoPointMade;
      t.twoPointAttempt += p.twoPointAttempt;
      t.ftMade += p.ftMade;
      t.ftAttempt += p.ftAttempt;
      t.offReb += p.offReb;
      t.defReb += p.defReb;
      t.totalReb += p.totalReb;
      t.assists += p.assists;
      t.steals += p.steals;
      t.blocks += p.blocks;
      t.turnovers += p.turnovers;
      t.personalFouls += p.personalFouls;
      t.foulsDrawn += p.foulsDrawn;
      t.totalMinutes += parseMinutes(p.minutes);
    }
    return t;
  }, [players]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(key === "number");
    }
  };

  const handleTabChange = (tab: "espoir" | "opponent") => {
    setActiveTab(tab);
    setSortKey("number");
    setSortAsc(true);
  };

  const thBase = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";
  const td = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Games
        </Link>
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-neutral-400 mb-2">{game.date.replace(/-/g, "/")}</p>
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <span className="text-xl sm:text-2xl font-bold">Espoir</span>
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-accent-purple">{game.teamPoints}</span>
            <span className="text-neutral-400">-</span>
            <span className="text-3xl sm:text-4xl font-bold text-neutral-300">{game.opponentPoints}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold">{game.opponent}</span>
        </div>
        {game.youtubeUrl && (
          <a
            href={game.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium text-white/80 bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            <Youtube size={16} />
            試合動画
          </a>
        )}
      </div>

      <GlassCard>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTabChange("espoir")}
            aria-pressed={activeTab === "espoir"}
            className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "espoir"
                ? "bg-accent-purple text-white"
                : "bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            Espoir
          </button>
          <button
            onClick={() => handleTabChange("opponent")}
            aria-pressed={activeTab === "opponent"}
            className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "opponent"
                ? "bg-accent-purple text-white"
                : "bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {game.opponent}
          </button>
        </div>

        {players.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">データがありません</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[900px]" aria-label={`${activeTab === "espoir" ? "Espoir" : game.opponent} スタッツ`}>
              <thead>
                <tr className="border-b border-white/10 text-neutral-400">
                  <th
                    className="text-left py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap sticky left-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 cursor-pointer select-none hover:text-white transition-colors"
                    scope="col"
                    onClick={() => handleSort("number")}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      選手
                      {sortKey === "number" && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </span>
                  </th>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="points">PTS</SortTh>
                  <th className={thBase} scope="col">3P</th>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="threePointPct">3P%</SortTh>
                  <th className={thBase} scope="col">2P</th>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="twoPointPct">2P%</SortTh>
                  <th className={thBase} scope="col">FT</th>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="ftPct">FT%</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="offReb">OR</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="defReb">DR</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="totalReb">REB</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="assists">AST</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="steals">STL</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="blocks">BLK</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="turnovers">TO</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="personalFouls">PF</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="foulsDrawn">FD</SortTh>
                  <th className={thBase} scope="col">MIN</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p: GamePlayerStat) => (
                  <tr key={p.number} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-1.5 sm:py-3 sm:px-2 font-medium whitespace-nowrap sticky left-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10">
                      <span className="text-accent-purple mr-1 sm:mr-2">#{p.number}</span>
                      {p.name}
                      {p.starter && <span className="ml-1 text-xs text-yellow-400">S</span>}
                    </td>
                    <td className={`${td} font-bold text-accent-purple`}>{p.points}</td>
                    <td className={td}>{p.threePointMade}/{p.threePointAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(p.threePointMade, p.threePointAttempt)}</td>
                    <td className={td}>{p.twoPointMade}/{p.twoPointAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(p.twoPointMade, p.twoPointAttempt)}</td>
                    <td className={td}>{p.ftMade}/{p.ftAttempt}</td>
                    <td className={`${td} text-neutral-400`}>{fmtPct(p.ftMade, p.ftAttempt)}</td>
                    <td className={td}>{p.offReb}</td>
                    <td className={td}>{p.defReb}</td>
                    <td className={`${td} font-semibold`}>{p.totalReb}</td>
                    <td className={td}>{p.assists}</td>
                    <td className={td}>{p.steals}</td>
                    <td className={td}>{p.blocks}</td>
                    <td className={td}>{p.turnovers}</td>
                    <td className={td}>{p.personalFouls}</td>
                    <td className={td}>{p.foulsDrawn}</td>
                    <td className={`${td} text-neutral-400`}>{p.minutes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 font-semibold">
                  <td className="py-2 px-1.5 sm:py-3 sm:px-2 sticky left-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10">TEAM</td>
                  <td className={`${td} text-accent-purple`}>{teamTotals.points}</td>
                  <td className={td}>{teamTotals.threePointMade}/{teamTotals.threePointAttempt}</td>
                  <td className={`${td} text-neutral-400`}>{fmtPct(teamTotals.threePointMade, teamTotals.threePointAttempt)}</td>
                  <td className={td}>{teamTotals.twoPointMade}/{teamTotals.twoPointAttempt}</td>
                  <td className={`${td} text-neutral-400`}>{fmtPct(teamTotals.twoPointMade, teamTotals.twoPointAttempt)}</td>
                  <td className={td}>{teamTotals.ftMade}/{teamTotals.ftAttempt}</td>
                  <td className={`${td} text-neutral-400`}>{fmtPct(teamTotals.ftMade, teamTotals.ftAttempt)}</td>
                  <td className={td}>{teamTotals.offReb}</td>
                  <td className={td}>{teamTotals.defReb}</td>
                  <td className={td}>{teamTotals.totalReb}</td>
                  <td className={td}>{teamTotals.assists}</td>
                  <td className={td}>{teamTotals.steals}</td>
                  <td className={td}>{teamTotals.blocks}</td>
                  <td className={td}>{teamTotals.turnovers}</td>
                  <td className={td}>{teamTotals.personalFouls}</td>
                  <td className={td}>{teamTotals.foulsDrawn}</td>
                  <td className={`${td} text-neutral-400`}>{formatMinutes(teamTotals.totalMinutes)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </GlassCard>
    </AnimatedSection>
  );
}
