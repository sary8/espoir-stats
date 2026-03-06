"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Youtube, ArrowLeft } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import { MapPin, Trophy, Calendar, Shield } from "lucide-react";
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

// --- Advanced Stats ---
function calcTeamPossEst(team: { threePointMade: number; threePointAttempt: number; twoPointMade: number; twoPointAttempt: number; ftAttempt: number; offReb: number; turnovers: number }, oppDefReb: number): number {
  const fga = team.twoPointAttempt + team.threePointAttempt;
  const fgm = team.twoPointMade + team.threePointMade;
  const orebFactor = team.offReb + oppDefReb > 0 ? team.offReb / (team.offReb + oppDefReb) : 0;
  return fga + 0.4 * team.ftAttempt - 1.07 * orebFactor * (fga - fgm) + team.turnovers;
}

function calcEff(p: GamePlayerStat): number {
  const fga = p.twoPointAttempt + p.threePointAttempt;
  const fgm = p.twoPointMade + p.threePointMade;
  return (p.points + p.totalReb + p.assists + p.steals + p.blocks) - ((fga - fgm) + (p.ftAttempt - p.ftMade) + p.turnovers);
}

function calcGmSc(p: GamePlayerStat): number {
  const fga = p.twoPointAttempt + p.threePointAttempt;
  const fgm = p.twoPointMade + p.threePointMade;
  return p.points + 0.4 * fgm - 0.7 * fga - 0.4 * (p.ftAttempt - p.ftMade) + 0.7 * p.offReb + 0.3 * p.defReb + p.steals + 0.7 * p.assists + 0.7 * p.blocks - 0.4 * p.personalFouls - p.turnovers;
}

type SortKey =
  | "number" | "points"
  | "threePointMade" | "threePointPct" | "twoPointMade" | "twoPointPct"
  | "ftMade" | "ftPct"
  | "offReb" | "defReb" | "totalReb"
  | "assists" | "steals" | "blocks" | "turnovers"
  | "personalFouls" | "foulsDrawn" | "eff" | "gmSc";

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

function ComparisonBar({ label, espoirVal, opponentVal, format = "number", opponentName }: {
  label: string;
  espoirVal: number;
  opponentVal: number;
  format?: "number" | "pct";
  opponentName: string;
}) {
  const eVal = Math.max(espoirVal, 0);
  const oVal = Math.max(opponentVal, 0);
  const max = Math.max(eVal, oVal, 1);
  const espoirPct = (eVal / max) * 100;
  const opponentPct = (oVal / max) * 100;
  const fmt = (v: number) => format === "pct" ? (v < 0 ? "-" : `${v.toFixed(1)}%`) : String(v);
  const espoirWins = eVal > oVal;
  const opponentWins = oVal > eVal;

  return (
    <div className="py-2.5">
      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
        <span className={espoirWins ? "text-accent-purple font-bold" : ""}>{fmt(espoirVal)}</span>
        <span className="font-medium text-neutral-300">{label}</span>
        <span className={opponentWins ? "text-white font-bold" : ""}>{fmt(opponentVal)}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 flex justify-end">
          <div
            className={`h-full rounded-l-full transition-all ${espoirWins ? "bg-accent-purple" : "bg-accent-purple/40"}`}
            style={{ width: `${espoirPct}%` }}
          />
        </div>
        <div className="flex-1">
          <div
            className={`h-full rounded-r-full transition-all ${opponentWins ? "bg-white/70" : "bg-white/20"}`}
            style={{ width: `${opponentPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LeaderCard({ category, players, espoirTeam }: {
  category: string;
  players: { name: string; number: number; value: number; team: string }[];
  espoirTeam: boolean[];
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">{category}</p>
      {players.map((p, i) => (
        <div key={i} className={`flex items-center justify-between ${i > 0 ? "mt-1.5" : ""}`}>
          <span className={`text-sm ${espoirTeam[i] ? "text-accent-purple" : "text-neutral-300"}`}>
            <span className="text-neutral-500 mr-1">#{p.number}</span>
            {p.name}
            <span className="text-[10px] text-neutral-500 ml-1">{p.team}</span>
          </span>
          <span className={`text-sm font-bold ${espoirTeam[i] ? "text-accent-purple" : "text-white"}`}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function GameDetailClient({ game }: GameDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"espoir" | "opponent">("espoir");
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortAsc, setSortAsc] = useState(true);

  const players = activeTab === "espoir" ? game.players : game.opponentPlayers;

  const espoirTotals = useMemo(() => {
    const t = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 0, totalReb: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, personalFouls: 0, foulsDrawn: 0, points: 0, totalMinutes: 0 };
    for (const p of game.players) {
      t.points += p.points; t.threePointMade += p.threePointMade; t.threePointAttempt += p.threePointAttempt;
      t.twoPointMade += p.twoPointMade; t.twoPointAttempt += p.twoPointAttempt;
      t.ftMade += p.ftMade; t.ftAttempt += p.ftAttempt;
      t.offReb += p.offReb; t.defReb += p.defReb; t.totalReb += p.totalReb;
      t.assists += p.assists; t.steals += p.steals; t.blocks += p.blocks;
      t.turnovers += p.turnovers; t.personalFouls += p.personalFouls; t.foulsDrawn += p.foulsDrawn;
      t.totalMinutes += parseMinutes(p.minutes);
    }
    return t;
  }, [game.players]);

  const opponentTotals = useMemo(() => {
    const t = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftMade: 0, ftAttempt: 0, offReb: 0, defReb: 0, totalReb: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, personalFouls: 0, foulsDrawn: 0, points: 0, totalMinutes: 0 };
    for (const p of game.opponentPlayers) {
      t.points += p.points; t.threePointMade += p.threePointMade; t.threePointAttempt += p.threePointAttempt;
      t.twoPointMade += p.twoPointMade; t.twoPointAttempt += p.twoPointAttempt;
      t.ftMade += p.ftMade; t.ftAttempt += p.ftAttempt;
      t.offReb += p.offReb; t.defReb += p.defReb; t.totalReb += p.totalReb;
      t.assists += p.assists; t.steals += p.steals; t.blocks += p.blocks;
      t.turnovers += p.turnovers; t.personalFouls += p.personalFouls; t.foulsDrawn += p.foulsDrawn;
      t.totalMinutes += parseMinutes(p.minutes);
    }
    return t;
  }, [game.opponentPlayers]);

  const gameLeaders = useMemo(() => {
    const all = [
      ...game.players.map(p => ({ ...p, team: "Espoir" })),
      ...game.opponentPlayers.map(p => ({ ...p, team: game.opponent })),
    ];
    const topN = (key: keyof GamePlayerStat, n = 3) =>
      [...all].sort((a, b) => (b[key] as number) - (a[key] as number)).slice(0, n);

    return {
      points: topN("points"),
      rebounds: topN("totalReb"),
      assists: topN("assists"),
      steals: topN("steals"),
      blocks: topN("blocks"),
    };
  }, [game.players, game.opponentPlayers, game.opponent]);

  const advancedStats = useMemo(() => {
    const ePossEst = calcTeamPossEst(espoirTotals, opponentTotals.defReb);
    const oPossEst = calcTeamPossEst(opponentTotals, espoirTotals.defReb);
    const poss = 0.5 * (ePossEst + oPossEst);
    const eMinDec = espoirTotals.totalMinutes / 60;
    const oMinDec = opponentTotals.totalMinutes / 60;
    const ePace = eMinDec > 0 ? 40 * (ePossEst + oPossEst) / (2 * (eMinDec / 5)) : 0;
    const oPace = oMinDec > 0 ? 40 * (ePossEst + oPossEst) / (2 * (oMinDec / 5)) : 0;
    const eOffRtg = poss > 0 ? 100 * game.teamPoints / poss : 0;
    const eDefRtg = poss > 0 ? 100 * game.opponentPoints / poss : 0;
    const oOffRtg = eDefRtg;
    const oDefRtg = eOffRtg;
    return {
      poss: Math.round(poss),
      espoir: { pace: ePace.toFixed(1), offRtg: eOffRtg.toFixed(1), defRtg: eDefRtg.toFixed(1), netRtg: (eOffRtg - eDefRtg).toFixed(1) },
      opponent: { pace: oPace.toFixed(1), offRtg: oOffRtg.toFixed(1), defRtg: oDefRtg.toFixed(1), netRtg: (oOffRtg - oDefRtg).toFixed(1) },
    };
  }, [espoirTotals, opponentTotals, game.teamPoints, game.opponentPoints]);

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
      } else if (sortKey === "eff") {
        va = calcEff(a); vb = calcEff(b);
      } else if (sortKey === "gmSc") {
        va = calcGmSc(a); vb = calcGmSc(b);
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      return sortAsc ? va - vb : vb - va;
    });
  }, [players, sortKey, sortAsc]);

  const teamTotals = activeTab === "espoir" ? espoirTotals : opponentTotals;

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
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Games
        </Link>
        {game.youtubeUrl ? (
          <a
            href={game.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            <Youtube size={16} />
            試合動画
          </a>
        ) : null}
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-neutral-400 mb-2">{game.date.replace(/-/g, "/")}</p>
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <span className="text-xl sm:text-2xl font-bold min-w-[80px] sm:min-w-[100px] text-right">Espoir</span>
          <div className="flex items-center">
            <span className="text-3xl sm:text-4xl font-bold text-accent-purple w-[56px] sm:w-[64px] text-right tabular-nums">{game.teamPoints}</span>
            <span className="text-neutral-400 w-[24px] sm:w-[32px] text-center">-</span>
            <span className="text-3xl sm:text-4xl font-bold text-neutral-300 w-[56px] sm:w-[64px] text-left tabular-nums">{game.opponentPoints}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold min-w-[80px] sm:min-w-[100px] text-left">{game.opponent}</span>
        </div>
      </div>

      {game.quarterScores.length > 0 && (
        <GlassCard className="mb-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-sm sm:text-base" aria-label="クォータースコア">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400">
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 w-1/3" scope="col"></th>
                  {game.quarterScores.map((q) => (
                    <th key={q.quarter} className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium" scope="col">{q.quarter}</th>
                  ))}
                  <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-bold" scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 px-3 sm:py-3 sm:px-4 font-bold">Espoir</td>
                  {game.quarterScores.map((q) => (
                    <td key={q.quarter} className={`text-center py-2 px-2 sm:py-3 sm:px-4 ${q.espoir > q.opponent ? "text-accent-purple font-semibold" : ""}`}>
                      {q.espoir}
                    </td>
                  ))}
                  <td className={`text-center py-2 px-2 sm:py-3 sm:px-4 font-bold ${game.teamPoints > game.opponentPoints ? "text-accent-purple" : ""}`}>
                    {game.teamPoints}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 font-bold">{game.opponent}</td>
                  {game.quarterScores.map((q) => (
                    <td key={q.quarter} className={`text-center py-2 px-2 sm:py-3 sm:px-4 ${q.opponent > q.espoir ? "text-neutral-200 font-semibold" : ""}`}>
                      {q.opponent}
                    </td>
                  ))}
                  <td className={`text-center py-2 px-2 sm:py-3 sm:px-4 font-bold ${game.opponentPoints > game.teamPoints ? "text-neutral-200" : ""}`}>
                    {game.opponentPoints}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {(game.gameInfo.tournament || game.gameInfo.venue || game.gameInfo.gameType) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {game.gameInfo.tournament && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
              <Trophy size={14} className="text-accent-purple shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">大会</p>
                <p className="text-sm">{game.gameInfo.tournament}</p>
              </div>
            </div>
          )}
          {game.gameInfo.venue && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
              <MapPin size={14} className="text-accent-purple shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">会場</p>
                <p className="text-sm">{game.gameInfo.venue}</p>
              </div>
            </div>
          )}
          {game.gameInfo.gameType && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
              <Shield size={14} className="text-accent-purple shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">種別</p>
                <p className="text-sm">{game.gameInfo.gameType}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
            <Calendar size={14} className="text-accent-purple shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">対戦日</p>
              <p className="text-sm">{game.date.replace(/-/g, "/")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Stats */}
      <GlassCard className="mb-6 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm" aria-label="Advanced Stats">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th className="text-left py-2.5 px-3 sm:py-3 sm:px-4" scope="col"></th>
                <th className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium" scope="col">PACE</th>
                <th className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium" scope="col">POSS</th>
                <th className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium" scope="col">OFFRTG</th>
                <th className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium" scope="col">DEFRTG</th>
                <th className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium" scope="col">NETRTG</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-bold text-accent-purple">Espoir</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums">{advancedStats.espoir.pace}</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums" rowSpan={2}>{advancedStats.poss}</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums">{advancedStats.espoir.offRtg}</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums">{advancedStats.espoir.defRtg}</td>
                <td className={`text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums font-bold ${parseFloat(advancedStats.espoir.netRtg) > 0 ? "text-green-400" : parseFloat(advancedStats.espoir.netRtg) < 0 ? "text-red-400" : ""}`}>
                  {parseFloat(advancedStats.espoir.netRtg) > 0 ? "+" : ""}{advancedStats.espoir.netRtg}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-bold">{game.opponent}</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums">{advancedStats.opponent.pace}</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums">{advancedStats.opponent.offRtg}</td>
                <td className="text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums">{advancedStats.opponent.defRtg}</td>
                <td className={`text-center py-2.5 px-2 sm:py-3 sm:px-3 tabular-nums font-bold ${parseFloat(advancedStats.opponent.netRtg) > 0 ? "text-green-400" : parseFloat(advancedStats.opponent.netRtg) < 0 ? "text-red-400" : ""}`}>
                  {parseFloat(advancedStats.opponent.netRtg) > 0 ? "+" : ""}{advancedStats.opponent.netRtg}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Team Comparison */}
      {game.opponentPlayers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <GlassCard>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-accent-purple">Espoir</span>
              <span className="text-xs text-neutral-400 font-medium">Team Comparison</span>
              <span className="text-sm font-bold text-neutral-300">{game.opponent}</span>
            </div>
            <div className="divide-y divide-white/5">
              <ComparisonBar label="FG%" espoirVal={pctVal(espoirTotals.twoPointMade + espoirTotals.threePointMade, espoirTotals.twoPointAttempt + espoirTotals.threePointAttempt)} opponentVal={pctVal(opponentTotals.twoPointMade + opponentTotals.threePointMade, opponentTotals.twoPointAttempt + opponentTotals.threePointAttempt)} format="pct" opponentName={game.opponent} />
              <ComparisonBar label="3P%" espoirVal={pctVal(espoirTotals.threePointMade, espoirTotals.threePointAttempt)} opponentVal={pctVal(opponentTotals.threePointMade, opponentTotals.threePointAttempt)} format="pct" opponentName={game.opponent} />
              <ComparisonBar label="2P%" espoirVal={pctVal(espoirTotals.twoPointMade, espoirTotals.twoPointAttempt)} opponentVal={pctVal(opponentTotals.twoPointMade, opponentTotals.twoPointAttempt)} format="pct" opponentName={game.opponent} />
              <ComparisonBar label="FT%" espoirVal={pctVal(espoirTotals.ftMade, espoirTotals.ftAttempt)} opponentVal={pctVal(opponentTotals.ftMade, opponentTotals.ftAttempt)} format="pct" opponentName={game.opponent} />
              <ComparisonBar label="PTS" espoirVal={espoirTotals.points} opponentVal={opponentTotals.points} opponentName={game.opponent} />
              <ComparisonBar label="REB" espoirVal={espoirTotals.totalReb} opponentVal={opponentTotals.totalReb} opponentName={game.opponent} />
              <ComparisonBar label="OR" espoirVal={espoirTotals.offReb} opponentVal={opponentTotals.offReb} opponentName={game.opponent} />
              <ComparisonBar label="DR" espoirVal={espoirTotals.defReb} opponentVal={opponentTotals.defReb} opponentName={game.opponent} />
              <ComparisonBar label="AST" espoirVal={espoirTotals.assists} opponentVal={opponentTotals.assists} opponentName={game.opponent} />
              <ComparisonBar label="STL" espoirVal={espoirTotals.steals} opponentVal={opponentTotals.steals} opponentName={game.opponent} />
              <ComparisonBar label="BLK" espoirVal={espoirTotals.blocks} opponentVal={opponentTotals.blocks} opponentName={game.opponent} />
              <ComparisonBar label="TO" espoirVal={espoirTotals.turnovers} opponentVal={opponentTotals.turnovers} opponentName={game.opponent} />
              <ComparisonBar label="PF" espoirVal={espoirTotals.personalFouls} opponentVal={opponentTotals.personalFouls} opponentName={game.opponent} />
              <ComparisonBar label="FD" espoirVal={espoirTotals.foulsDrawn} opponentVal={opponentTotals.foulsDrawn} opponentName={game.opponent} />
            </div>
          </GlassCard>

          {/* Game Leaders */}
          <GlassCard>
            <p className="text-xs text-neutral-400 font-medium mb-3 text-center">Game Leaders</p>
            <div className="grid grid-cols-1 gap-2">
              {(["points", "rebounds", "assists", "steals", "blocks"] as const).map((cat) => {
                const labels = { points: "PTS", rebounds: "REB", assists: "AST", steals: "STL", blocks: "BLK" } as const;
                const keys = { points: "points", rebounds: "totalReb", assists: "assists", steals: "steals", blocks: "blocks" } as const;
                const top = gameLeaders[cat];
                if (top.length === 0 || (top[0][keys[cat]] as number) === 0) return null;
                return (
                  <LeaderCard
                    key={cat}
                    category={labels[cat]}
                    players={top.map(p => ({ name: p.name, number: p.number, value: p[keys[cat]] as number, team: p.team }))}
                    espoirTeam={top.map(p => p.team === "Espoir")}
                  />
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      <div className="flex gap-2 mb-4">
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

      <GlassCard className="!p-0">
        {players.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[1000px]" aria-label={`${activeTab === "espoir" ? "Espoir" : game.opponent} スタッツ`}>
              <thead>
                <tr className="border-b border-white/10 text-neutral-400">
                  <th
                    className="text-left py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 whitespace-nowrap sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10 cursor-pointer select-none hover:text-white transition-colors"
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
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="eff">EFF</SortTh>
                  <SortTh sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} k="gmSc">GmSc</SortTh>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p: GamePlayerStat) => (
                  <tr key={p.number} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 font-medium whitespace-nowrap sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10">
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
                    <td className={`${td} font-semibold ${calcEff(p) > 0 ? "text-green-400" : calcEff(p) < 0 ? "text-red-400" : ""}`}>{calcEff(p)}</td>
                    <td className={`${td} font-semibold ${calcGmSc(p) > 0 ? "text-green-400" : calcGmSc(p) < 0 ? "text-red-400" : ""}`}>{calcGmSc(p).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 font-semibold">
                  <td className="py-2 pl-3 pr-1.5 sm:py-3 sm:pl-4 sm:pr-2 sticky left-0 bg-[#0a0a0f] z-10 border-r border-white/10">TEAM</td>
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
                  <td className={td}>{players.reduce((s, p) => s + calcEff(p), 0)}</td>
                  <td className={td}>{players.reduce((s, p) => s + calcGmSc(p), 0).toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </GlassCard>
    </AnimatedSection>
  );
}
