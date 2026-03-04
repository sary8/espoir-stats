"use client";

import { useState } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameResult } from "@/lib/types";

interface GameBreakdownProps {
  games: GameResult[];
}

export default function GameBreakdown({ games }: GameBreakdownProps) {
  const [activeGame, setActiveGame] = useState(0);
  const game = games[activeGame];

  return (
    <AnimatedSection id="games" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Game <span className="text-accent-orange">Breakdown</span>
      </h2>
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-6">
          {games.map((g, i) => (
            <button
              key={g.opponent}
              onClick={() => setActiveGame(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th className="text-left py-3 px-2">選手</th>
                <th className="text-center py-3 px-2">GS</th>
                <th className="text-center py-3 px-2">PTS</th>
                <th className="text-center py-3 px-2">3PM</th>
                <th className="text-center py-3 px-2">2PM</th>
                <th className="text-center py-3 px-2">FTM</th>
                <th className="text-center py-3 px-2">REB</th>
                <th className="text-center py-3 px-2">AST</th>
                <th className="text-center py-3 px-2">STL</th>
                <th className="text-center py-3 px-2">BLK</th>
                <th className="text-center py-3 px-2">TO</th>
                <th className="text-center py-3 px-2">MIN</th>
              </tr>
            </thead>
            <tbody>
              {game.players.map((p) => (
                <tr key={p.number} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <span className="text-accent-orange mr-2">#{p.number}</span>
                    {p.name}
                  </td>
                  <td className="text-center py-3 px-2">{p.starter ? "●" : ""}</td>
                  <td className="text-center py-3 px-2 font-bold text-accent-orange">{p.points}</td>
                  <td className="text-center py-3 px-2">{p.threePointMade}/{p.threePointAttempt}</td>
                  <td className="text-center py-3 px-2">{p.twoPointMade}/{p.twoPointAttempt}</td>
                  <td className="text-center py-3 px-2">{p.ftMade}/{p.ftAttempt}</td>
                  <td className="text-center py-3 px-2">{p.totalReb}</td>
                  <td className="text-center py-3 px-2">{p.assists}</td>
                  <td className="text-center py-3 px-2">{p.steals}</td>
                  <td className="text-center py-3 px-2">{p.blocks}</td>
                  <td className="text-center py-3 px-2">{p.turnovers}</td>
                  <td className="text-center py-3 px-2 text-neutral-400">{p.minutes}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 font-semibold">
                <td className="py-3 px-2" colSpan={2}>TEAM</td>
                <td className="text-center py-3 px-2 text-accent-orange">{game.teamPoints}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.threePointMade, 0)}/{game.players.reduce((s, p) => s + p.threePointAttempt, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.twoPointMade, 0)}/{game.players.reduce((s, p) => s + p.twoPointAttempt, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.ftMade, 0)}/{game.players.reduce((s, p) => s + p.ftAttempt, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.totalReb, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.assists, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.steals, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.blocks, 0)}</td>
                <td className="text-center py-3 px-2">{game.players.reduce((s, p) => s + p.turnovers, 0)}</td>
                <td className="text-center py-3 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>
    </AnimatedSection>
  );
}
