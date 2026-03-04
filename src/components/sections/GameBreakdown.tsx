"use client";

import { useState, useMemo } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { GameResult } from "@/lib/types";

function fmtPct(made: number, attempt: number): string {
  if (attempt === 0) return "-";
  return `${((made / attempt) * 100).toFixed(1)}%`;
}

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
    let offReb = 0, defReb = 0, totalReb = 0;
    let assists = 0, steals = 0, blocks = 0, turnovers = 0;
    let personalFouls = 0, foulsDrawn = 0;
    for (const p of game.players) {
      threePointMade += p.threePointMade;
      threePointAttempt += p.threePointAttempt;
      twoPointMade += p.twoPointMade;
      twoPointAttempt += p.twoPointAttempt;
      ftMade += p.ftMade;
      ftAttempt += p.ftAttempt;
      offReb += p.offReb;
      defReb += p.defReb;
      totalReb += p.totalReb;
      assists += p.assists;
      steals += p.steals;
      blocks += p.blocks;
      turnovers += p.turnovers;
      personalFouls += p.personalFouls;
      foulsDrawn += p.foulsDrawn;
    }
    return {
      threePointMade, threePointAttempt,
      twoPointMade, twoPointAttempt,
      ftMade, ftAttempt,
      offReb, defReb, totalReb,
      assists, steals, blocks, turnovers,
      personalFouls, foulsDrawn,
    };
  }, [game]);

  const th = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";
  const td = "text-center py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap";

  return (
    <AnimatedSection id="games" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Game <span className="text-accent-purple">Breakdown</span>
      </h2>
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-6">
          {games.map((g, i) => (
            <button
              key={g.opponent}
              onClick={() => setActiveGame(i)}
              aria-pressed={i === activeGame}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                i === activeGame
                  ? "bg-accent-purple text-white"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10"
              }`}
            >
              vs {g.opponent}
              <span className="ml-2 text-xs opacity-75">{g.teamPoints}pts</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs sm:text-sm min-w-[900px]" aria-label={`vs ${game.opponent} 個人スタッツ`}>
            <caption className="sr-only">vs {game.opponent} の試合における各選手のスタッツ</caption>
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th className="text-left py-2 px-1.5 sm:py-3 sm:px-2 whitespace-nowrap sticky left-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10" scope="col">選手</th>
                <th className={th} scope="col">GS</th>
                <th className={th} scope="col">PTS</th>
                <th className={th} scope="col">3P</th>
                <th className={th} scope="col">3P%</th>
                <th className={th} scope="col">2P</th>
                <th className={th} scope="col">2P%</th>
                <th className={th} scope="col">FT</th>
                <th className={th} scope="col">FT%</th>
                <th className={th} scope="col">OR</th>
                <th className={th} scope="col">DR</th>
                <th className={th} scope="col">REB</th>
                <th className={th} scope="col">AST</th>
                <th className={th} scope="col">STL</th>
                <th className={th} scope="col">BLK</th>
                <th className={th} scope="col">TO</th>
                <th className={th} scope="col">PF</th>
                <th className={th} scope="col">FD</th>
                <th className={th} scope="col">MIN</th>
              </tr>
            </thead>
            <tbody>
              {game.players.map((p) => (
                <tr key={p.number} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-1.5 sm:py-3 sm:px-2 font-medium whitespace-nowrap sticky left-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10">
                    <span className="text-accent-purple mr-1 sm:mr-2">#{p.number}</span>
                    {p.name}
                  </td>
                  <td className={td}>{p.starter ? <span aria-label="スターター">●</span> : ""}</td>
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
                <td className={td}></td>
                <td className={`${td} text-accent-purple`}>{game.teamPoints}</td>
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
                <td className={td}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>
    </AnimatedSection>
  );
}
