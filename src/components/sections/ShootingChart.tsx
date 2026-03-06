"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import { shootingColors } from "@/config/theme";

const tooltipStyle = {
  background: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
} as const;
const tooltipLabelStyle = { color: "#fff" } as const;

interface ShootingChartProps {
  data: { name: string; threePointPct: number; twoPointPct: number; ftPct: number }[];
}

export default function ShootingChart({ data }: ShootingChartProps) {
  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center [text-wrap:balance]">
        Shooting <span className="text-accent-purple">Comparison</span>
      </h2>
      <GlassCard>
        <p className="sr-only">選手別のシュート成功率を示す棒グラフ（3P%、2P%、FT%）。</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={30} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              cursor={{ fill: "rgba(168, 85, 247, 0.08)" }}
            />
            <Legend />
            <Bar dataKey="threePointPct" name="3P%" fill={shootingColors.threePoint} radius={[4, 4, 0, 0]} barSize={14} />
            <Bar dataKey="twoPointPct" name="2P%" fill={shootingColors.twoPoint} radius={[4, 4, 0, 0]} barSize={14} />
            <Bar dataKey="ftPct" name="FT%" fill={shootingColors.freeThrow} radius={[4, 4, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </AnimatedSection>
  );
}
