"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import { playerColors } from "@/config/theme";

interface RadarPlayer {
  number: number;
  name: string;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
}

interface PlayerRadarProps {
  players: RadarPlayer[];
}

type StatKey = "ppg" | "rpg" | "apg" | "spg" | "bpg";

const statKeyMap: Record<string, StatKey> = {
  PPG: "ppg",
  RPG: "rpg",
  APG: "apg",
  SPG: "spg",
  BPG: "bpg",
};

function CustomTooltip({ active, label, selectedPlayers, colorMap }: {
  active?: boolean;
  label?: string;
  selectedPlayers: RadarPlayer[];
  colorMap: Map<string, string>;
}) {
  if (!active || !label || selectedPlayers.length === 0) return null;
  const key = statKeyMap[label];
  if (!key) return null;

  return (
    <div className="rounded-lg bg-neutral-900/95 border border-white/10 px-3 py-2 shadow-lg animate-fade-in">
      <p className="text-xs text-neutral-400 mb-1.5">{label}</p>
      {selectedPlayers.map((p) => (
        <div key={p.number} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorMap.get(p.name) }} />
          <span className="text-neutral-300">{p.name.split(" ").pop()}</span>
          <span className="ml-auto font-bold text-white">{p[key].toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PlayerRadar({ players }: PlayerRadarProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsResizing(true);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => setIsResizing(false), 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, []);

  const selectedPlayers = useMemo(
    () => players.filter((p) => selected.includes(p.number)),
    [players, selected]
  );

  const maxValues = useMemo(() => {
    let maxPts = 1, maxReb = 1, maxAst = 1, maxStl = 1, maxBlk = 1;
    for (const p of players) {
      if (p.ppg > maxPts) maxPts = p.ppg;
      if (p.rpg > maxReb) maxReb = p.rpg;
      if (p.apg > maxAst) maxAst = p.apg;
      if (p.spg > maxStl) maxStl = p.spg;
      if (p.bpg > maxBlk) maxBlk = p.bpg;
    }
    return { maxPts, maxReb, maxAst, maxStl, maxBlk };
  }, [players]);

  const radarData = useMemo(() => {
    const { maxPts, maxReb, maxAst, maxStl, maxBlk } = maxValues;
    return [
      { stat: "PPG", _grid: 0, ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round((p.ppg / maxPts) * 100)])) },
      { stat: "RPG", _grid: 0, ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round((p.rpg / maxReb) * 100)])) },
      { stat: "APG", _grid: 0, ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round((p.apg / maxAst) * 100)])) },
      { stat: "SPG", _grid: 0, ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round((p.spg / maxStl) * 100)])) },
      { stat: "BPG", _grid: 0, ...Object.fromEntries(selectedPlayers.map((p) => [p.name, Math.round((p.bpg / maxBlk) * 100)])) },
    ];
  }, [selectedPlayers, maxValues]);

  const colorMap = useMemo(
    () => new Map(selectedPlayers.map((p) => [p.name, playerColors[players.indexOf(p) % playerColors.length]])),
    [selectedPlayers, players]
  );

  const togglePlayer = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const renderTooltip = useCallback(
    (props: { active?: boolean; label?: string | number }) => (
      <CustomTooltip {...props} label={String(props.label ?? "")} selectedPlayers={selectedPlayers} colorMap={colorMap} />
    ),
    [selectedPlayers, colorMap]
  );

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Player <span className="text-accent-purple">Comparison</span>
      </h2>
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-2 justify-center">
          {players.map((p) => (
            <button
              key={p.number}
              onClick={() => togglePlayer(p.number)}
              aria-pressed={selected.includes(p.number)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
                selected.includes(p.number)
                  ? "bg-accent-purple/20 border-accent-purple/50 text-purple-300"
                  : "border-white/10 text-neutral-400 hover:border-white/30"
              }`}
            >
              #{p.number} {p.name.split(" ").pop()}
            </button>
          ))}
        </div>
        <p className="sr-only">選手の能力比較レーダーチャート（PPG、RPG、APG、SPG、BPG）。1試合あたりの平均値で比較。</p>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="stat" tick={{ fill: "#a3a3a3", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="_grid" stroke="transparent" fill="transparent" />
            {selectedPlayers.map((p) => (
              <Radar
                key={p.number}
                name={p.name}
                dataKey={p.name}
                stroke={playerColors[players.indexOf(p) % playerColors.length]}
                fill={playerColors[players.indexOf(p) % playerColors.length]}
                fillOpacity={0.15}
                strokeWidth={2}
                isAnimationActive={!isResizing}
              />
            ))}
            {selectedPlayers.length > 0 && (
              <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            )}
            <Legend content={() => (
              <div className={`flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 min-h-[24px] ${selectedPlayers.length > 4 ? "grid grid-cols-3 sm:flex" : ""}`}>
                {selectedPlayers.map((p) => (
                  <div key={p.number} className="flex items-center gap-1 text-xs sm:text-sm">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm shrink-0" style={{ background: colorMap.get(p.name) }} />
                    <span className="text-neutral-300">{p.name.split(" ").pop()}</span>
                  </div>
                ))}
              </div>
            )} />
          </RadarChart>
        </ResponsiveContainer>
      </GlassCard>
    </AnimatedSection>
  );
}
