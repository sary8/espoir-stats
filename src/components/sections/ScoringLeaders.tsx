"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { PlayerSummary } from "@/lib/types";
import { playerColors } from "@/config/theme";

interface ScoringLeadersProps {
  players: PlayerSummary[];
}

export default function ScoringLeaders({ players }: ScoringLeadersProps) {
  const data = [...players]
    .sort((a, b) => b.ppg - a.ppg)
    .map((p) => ({ name: p.name, ppg: p.ppg, number: p.number }));

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Scoring <span className="text-accent-orange">Leaders</span>
      </h2>
      <GlassCard>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
            <XAxis type="number" domain={[0, "auto"]} />
            <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 13 }} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#f97316" }}
              formatter={(value) => [`${value} PPG`, "平均得点"]}
            />
            <Bar dataKey="ppg" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={playerColors[i % playerColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </AnimatedSection>
  );
}
