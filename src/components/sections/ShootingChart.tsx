"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import type { PlayerSummary } from "@/lib/types";
import { shootingColors } from "@/config/theme";

interface ShootingChartProps {
  players: PlayerSummary[];
}

export default function ShootingChart({ players }: ShootingChartProps) {
  const data = [...players]
    .sort((a, b) => b.ppg - a.ppg)
    .map((p) => ({
      name: p.name.split(" ").pop(),
      "3P%": p.threePointPct ?? 0,
      "2P%": p.twoPointPct ?? 0,
      "FT%": p.ftPct ?? 0,
    }));

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Shooting <span className="text-accent-orange">Comparison</span>
      </h2>
      <GlassCard>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
            <Legend />
            <Bar dataKey="3P%" fill={shootingColors.threePoint} radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="2P%" fill={shootingColors.twoPoint} radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="FT%" fill={shootingColors.freeThrow} radius={[4, 4, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </AnimatedSection>
  );
}
