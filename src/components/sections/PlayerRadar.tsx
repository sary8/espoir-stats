"use client";

import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { PlayerSummary } from "@/lib/types";
import { playerColors } from "@/config/theme";

interface PlayerRadarProps {
  players: PlayerSummary[];
}

function normalize(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.round((v / max) * 100));
}

export default function PlayerRadar({ players }: PlayerRadarProps) {
  const [selected, setSelected] = useState<number[]>([players[0]?.number, players[1]?.number].filter(Boolean));

  const selectedPlayers = players.filter((p) => selected.includes(p.number));

  const allPts = players.map((p) => p.ppg);
  const allReb = players.map((p) => p.totalReb / p.games);
  const allAst = players.map((p) => p.assists / p.games);
  const allStl = players.map((p) => p.steals / p.games);
  const allBlk = players.map((p) => p.blocks / p.games);

  const maxPts = Math.max(...allPts, 1);
  const maxReb = Math.max(...allReb, 1);
  const maxAst = Math.max(...allAst, 1);
  const maxStl = Math.max(...allStl, 1);
  const maxBlk = Math.max(...allBlk, 1);

  const radarData = [
    { stat: "PTS", ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round((p.ppg / maxPts) * 100)])) },
    { stat: "REB", ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round(((p.totalReb / p.games) / maxReb) * 100)])) },
    { stat: "AST", ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round(((p.assists / p.games) / maxAst) * 100)])) },
    { stat: "STL", ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round(((p.steals / p.games) / maxStl) * 100)])) },
    { stat: "BLK", ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round(((p.blocks / p.games) / maxBlk) * 100)])) },
  ];

  const togglePlayer = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : prev.length < 3 ? [...prev, num] : prev
    );
  };

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Player <span className="text-accent-orange">Comparison</span>
      </h2>
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {players.map((p) => (
            <button
              key={p.number}
              onClick={() => togglePlayer(p.number)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selected.includes(p.number)
                  ? "bg-accent-orange/20 border-accent-orange/50 text-orange-300"
                  : "border-white/10 text-neutral-400 hover:border-white/30"
              }`}
            >
              #{p.number} {p.name.split(" ").pop()}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="stat" tick={{ fill: "#a3a3a3", fontSize: 13 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            {selectedPlayers.map((p, i) => (
              <Radar
                key={p.number}
                name={p.name}
                dataKey={p.name}
                stroke={playerColors[players.indexOf(p) % playerColors.length]}
                fill={playerColors[players.indexOf(p) % playerColors.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </GlassCard>
    </AnimatedSection>
  );
}
