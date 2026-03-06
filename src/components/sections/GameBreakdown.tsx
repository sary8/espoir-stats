"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Youtube } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameSummary } from "./LazyCharts";

function fmtPct(made: number, attempt: number): string {
  if (attempt === 0) return "-";
  return `${((made / attempt) * 100).toFixed(1)}%`;
}

function pctVal(made: number, attempt: number): number {
  if (attempt === 0) return -1;
  return (made / attempt) * 100;
}

type SortKey =
  | "number" | "points"
  | "threePointMade" | "threePointPct" | "twoPointMade" | "twoPointPct"
  | "ftMade" | "ftPct"
  | "offReb" | "defReb" | "totalReb"
  | "assists" | "steals" | "blocks" | "turnovers"
  | "personalFouls" | "foulsDrawn";

interface AggregatedPlayer {
  number: number;
  name: string;
  gamesPlayed: number;
  starterCount: number;
  points: number;
  threePointMade: number;
  threePointAttempt: number;
  twoPointMade: number;
  twoPointAttempt: number;
  ftMade: number;
  ftAttempt: number;
  offReb: number;
  defReb: number;
  totalReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personalFouls: number;
  foulsDrawn: number;
  totalMinutes: number;
}

function SortTh({ k, sortKey, sortAsc, onSort, children }: {
  k: SortKey;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (k: SortKey) => void;
  children: React.ReactNode;
}) {
  const isActive = sortKey === k;
  return (
    <th className="text-center py-0 px-0 whitespace-nowrap" scope="col">
      <button type="button" className="w-full py-2 px-1.5 sm:py-3 sm:px-2 cursor-pointer select-none hover:text-white transition-colors" onClick={() => onSort(k)} aria-label={`${typeof children === 'string' ? children : k}でソート`}>
        <span className="inline-flex items-center gap-0.5">
          {children}
          {isActive
            ? (sortAsc ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />)
            : <ChevronDown size={10} className="opacity-30" aria-hidden="true" />}
        </span>
      </button>
    </th>
  );
}

interface GameBreakdownProps {
  games: GameSummary[];
}

export default function GameBreakdown({ games }: GameBreakdownProps) {
  const [activeGame, setActiveGame] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortAsc, setSortAsc] = useState(true);
  const isAllGames = activeGame === games.length;

  const allGamesAggregated = useMemo(() => {
    const map = new Map<number, AggregatedPlayer>();
    for (const game of games) {
      for (const p of game.players) {
        const existing = map.get(p.number);
        if (existing) {
          existing.gamesPlayed += 1;
          existing.starterCount += p.starter ? 1 : 0;
          existing.points += p.points;
          existing.threePointMade += p.threePointMade;
          existing.threePointAttempt += p.threePointAttempt;
          existing.twoPointMade += p.twoPointMade;
          existing.twoPointAttempt += p.twoPointAttempt;
          existing.ftMade += p.ftMade;
          existing.ftAttempt += p.ftAttempt;
          existing.offReb += p.offReb;
          existing.defReb += p.defReb;
          existing.totalReb += p.totalReb;
          existing.assists += p.assists;
          existing.steals += p.steals;
          existing.blocks += p.blocks;
          existing.turnovers += p.turnovers;
          existing.personalFouls += p.personalFouls;
          existing.foulsDrawn += p.foulsDrawn;
          existing.totalMinutes += parseMinutes(p.minutes);
        } else {
          map.set(p.number, {
            number: p.number,
            name: p.name,
            gamesPlayed: 1,
            starterCount: p.starter ? 1 : 0,
            points: p.points,
            threePointMade: p.threePointMade,
            threePointAttempt: p.threePointAttempt,
            twoPointMade: p.twoPointMade,
            twoPointAttempt: p.twoPointAttempt,
            ftMade: p.ftMade,
            ftAttempt: p.ftAttempt,
            offReb: p.offReb,
            defReb: p.defReb,
            totalReb: p.totalReb,
            assists: p.assists,
            steals: p.steals,
            blocks: p.blocks,
            turnovers: p.turnovers,
            personalFouls: p.personalFouls,
            foulsDrawn: p.foulsDrawn,
            totalMinutes: parseMinutes(p.minutes),
          });
        }
      }
    }
    return Array.from(map.values());
  }, [games]);

  const currentPlayers = useMemo(() => {
    if (isAllGames) return allGamesAggregated;
    return games[activeGame].players.map((p): AggregatedPlayer => ({
      number: p.number,
      name: p.name,
      gamesPlayed: 1,
      starterCount: p.starter ? 1 : 0,
      points: p.points,
      threePointMade: p.threePointMade,
      threePointAttempt: p.threePointAttempt,
      twoPointMade: p.twoPointMade,
      twoPointAttempt: p.twoPointAttempt,
      ftMade: p.ftMade,
      ftAttempt: p.ftAttempt,
      offReb: p.offReb,
      defReb: p.defReb,
      totalReb: p.totalReb,
      assists: p.assists,
      steals: p.steals,
      blocks: p.blocks,
      turnovers: p.turnovers,
      personalFouls: p.personalFouls,
      foulsDrawn: p.foulsDrawn,
      totalMinutes: parseMinutes(p.minutes),
    }));
  }, [isAllGames, activeGame, games, allGamesAggregated]);

  const sortedPlayers = useMemo(() => {
    const real = currentPlayers.filter(p => p.name !== "Team/Coaches");
    const tc = currentPlayers.filter(p => p.name === "Team/Coaches");
    const sorted = [...real].sort((a, b) => {
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
    return [...sorted, ...tc];
  }, [currentPlayers, sortKey, sortAsc]);

  const teamTotals = useMemo(() => {
    const t = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 0, totalReb: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, personalFouls: 0, foulsDrawn: 0, points: 0, totalMinutes: 0 };
    for (const p of currentPlayers) {
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
      t.totalMinutes += p.totalMinutes;
    }
    return t;
  }, [currentPlayers]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(key === "number");
    }
  };

  const thBase = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";
  const td = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap tabular-nums";

  const label = isAllGames ? "全試合合計" : `vs ${games[activeGame].opponent}`;

  return (
    <AnimatedSection id="games" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
        Game <span className="text-accent-purple">Breakdown</span>
      </h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setActiveGame(games.length); setSortKey("number"); setSortAsc(true); }}
          aria-pressed={isAllGames}
          className={`px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-[background-color,color] cursor-pointer ${
            isAllGames
              ? "bg-accent-purple text-white"
              : "bg-white/5 text-neutral-400 hover:bg-white/10"
          }`}
        >
          ALL
        </button>
        {games.map((g, i) => (
          <div key={g.opponent} className="flex items-center gap-1">
            <button
              onClick={() => { setActiveGame(i); setSortKey("number"); setSortAsc(true); }}
              aria-pressed={i === activeGame}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-[background-color,color] cursor-pointer ${
                i === activeGame && !isAllGames
                  ? "bg-accent-purple text-white"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10"
              }`}
            >
              <span className="block">{(g.date ?? "").slice(0, 10).replace(/-/g, "/")} vs {g.opponent}</span>
              <span className="text-xs opacity-75">{g.teamPoints}pts</span>
            </button>
            {g.youtubeUrl && (
              <a
                href={g.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${g.opponent}戦の試合動画`}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Youtube size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        ))}
      </div>

      <GlassCard className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[900px]" aria-label={`${label} 個人スタッツ`}>
            <caption className="sr-only">{label} における各選手のスタッツ</caption>
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th
                  className="text-left py-0 px-0 whitespace-nowrap sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10"
                  scope="col"
                >
                  <button type="button" className="w-full text-left py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort("number")} aria-label="選手番号でソート">
                    <span className="inline-flex items-center gap-0.5">
                      選手
                      {sortKey === "number" && (sortAsc ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />)}
                    </span>
                  </button>
                </th>
                {isAllGames && <th className={thBase} scope="col">GP</th>}
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
              {sortedPlayers.map((p) => {
                const isTC = p.name === "Team/Coaches";
                return (
                <tr key={isTC ? "team-coaches" : p.number} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isTC ? "italic text-neutral-500" : ""}`}>
                  <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 font-medium whitespace-nowrap sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10">
                    {isTC ? (
                      <span className="text-neutral-500">Team/Coaches</span>
                    ) : (
                      <><span className="text-accent-purple mr-1 sm:mr-2">#{p.number}</span>{p.name}</>
                    )}
                  </td>
                  {isAllGames && <td className={td}>{isTC ? "" : p.gamesPlayed}</td>}
                  <td className={`${td} ${isTC ? "" : "font-bold text-accent-purple"}`}>{p.points || ""}</td>
                  <td className={td}>{isTC ? "" : `${p.threePointMade}/${p.threePointAttempt}`}</td>
                  <td className={`${td} text-neutral-400`}>{isTC ? "" : fmtPct(p.threePointMade, p.threePointAttempt)}</td>
                  <td className={td}>{isTC ? "" : `${p.twoPointMade}/${p.twoPointAttempt}`}</td>
                  <td className={`${td} text-neutral-400`}>{isTC ? "" : fmtPct(p.twoPointMade, p.twoPointAttempt)}</td>
                  <td className={td}>{isTC ? "" : `${p.ftMade}/${p.ftAttempt}`}</td>
                  <td className={`${td} text-neutral-400`}>{isTC ? "" : fmtPct(p.ftMade, p.ftAttempt)}</td>
                  <td className={td}>{p.offReb || ""}</td>
                  <td className={td}>{p.defReb || ""}</td>
                  <td className={`${td} font-semibold`}>{p.totalReb || ""}</td>
                  <td className={td}>{isTC ? "" : p.assists}</td>
                  <td className={td}>{isTC ? "" : p.steals}</td>
                  <td className={td}>{isTC ? "" : p.blocks}</td>
                  <td className={td}>{isTC ? "" : p.turnovers}</td>
                  <td className={td}>{isTC ? "" : p.personalFouls}</td>
                  <td className={td}>{isTC ? "" : p.foulsDrawn}</td>
                  <td className={`${td} text-neutral-400`}>{isTC ? "" : formatMinutes(p.totalMinutes)}</td>
                </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 font-semibold">
                <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10">TEAM</td>
                {isAllGames && <td className={td}></td>}
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
      </GlassCard>
    </AnimatedSection>
  );
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
