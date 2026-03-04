"use client";

import { useState, useMemo } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameResult } from "@/lib/types";

interface GameBreakdownProps {
  games: GameResult[];
}

export default function GameBreakdown({ games }: GameBreakdownProps) {
  const [activeGame, setActiveGame] = useState(0);
  const game = games[activeGame];

  const teamTotals = useMemo(() => {
    let threePointMade = 0, threePointAttempt = 0;
    let twoPointMade = 0, twoPointAttempt = 0;
    let ftMade = 0, ftAttempt = 0;
    let totalReb = 0, assists = 0, steals = 0, blocks = 0, turnovers = 0;
    for (const p of game.players) {
      threePointMade += p.threePointMade;
      threePointAttempt += p.threePointAttempt;
      twoPointMade += p.twoPointMade;
      twoPointAttempt += p.twoPointAttempt;
      ftMade += p.ftMade;
      ftAttempt += p.ftAttempt;
      totalReb += p.totalReb;
      assists += p.assists;
      steals += p.steals;
      blocks += p.blocks;
      turnovers += p.turnovers;
    }
    return { threePointMade, threePointAttempt, twoPointMade, twoPointAttempt, ftMade, ftAttempt, totalReb, assists, steals, blocks, turnovers };
  }, [game]);

  return (
    <AnimatedSection id="games" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Game <span className="text-accent-orange">Breakdown</span>
      </h2>
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-6">
          {games.map((g, i) => (
            <button
              key={g.opponent}
              onClick={() => setActiveGame(i)}
              aria-pressed={i === activeGame}
              className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all cursor-pointer ${
                i === activeGame
                  ? "bg-accent-orange text-white"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10"
              }`}
            >
              vs {g.opponent}
              <span className="ml-2 text-xs opacity-75">{g.teamPoints}pts</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs sm:text-sm" aria-label={`vs ${game.opponent} 個人スタッツ`}>
            <caption className="sr-only">vs {game.opponent} の試合における各選手のスタッツ</caption>
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th className="text-left py-2 px-1 sm:py-3 sm:px-2 whitespace-nowrap" scope="col">選手</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell" scope="col">GS</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">PTS</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">3PM</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">2PM</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">FTM</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">REB</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">AST</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">STL</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell" scope="col">BLK</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2" scope="col">TO</th>
                <th className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell" scope="col">MIN</th>
              </tr>
            </thead>
            <tbody>
              {game.players.map((p) => (
                <tr key={p.number} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-1 sm:py-3 sm:px-2 font-medium whitespace-nowrap">
                    <span className="text-accent-orange mr-1 sm:mr-2">#{p.number}</span>
                    <span className="hidden sm:inline">{p.name}</span>
                    <span className="sm:hidden">{p.name.split(" ").pop()}</span>
                  </td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell">{p.starter ? <span aria-label="スターター">●</span> : ""}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2 font-bold text-accent-orange">{p.points}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.threePointMade}/{p.threePointAttempt}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.twoPointMade}/{p.twoPointAttempt}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.ftMade}/{p.ftAttempt}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.totalReb}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.assists}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.steals}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell">{p.blocks}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{p.turnovers}</td>
                  <td className="text-center py-2 px-1 sm:py-3 sm:px-2 text-neutral-400 hidden sm:table-cell">{p.minutes}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 font-semibold">
                <td className="py-2 px-1 sm:py-3 sm:px-2">TEAM</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell"></td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2 text-accent-orange">{game.teamPoints}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.threePointMade}/{teamTotals.threePointAttempt}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.twoPointMade}/{teamTotals.twoPointAttempt}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.ftMade}/{teamTotals.ftAttempt}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.totalReb}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.assists}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.steals}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell">{teamTotals.blocks}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2">{teamTotals.turnovers}</td>
                <td className="text-center py-2 px-1 sm:py-3 sm:px-2 hidden sm:table-cell"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>
    </AnimatedSection>
  );
}
