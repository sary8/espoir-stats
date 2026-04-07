"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import { shootingColors, tooltipStyle, tooltipLabelStyle } from "@/config/theme";

interface ShootingChartProps {
  data: { name: string; threePointPct: number; twoPointPct: number; ftPct: number }[];
}

export default function ShootingChart({ data }: ShootingChartProps) {
  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center uppercase tracking-wider">
        Shooting <span className="text-accent-purple">Comparison</span>
      </h2>
      <div className="court-divider mb-6 sm:mb-8" aria-hidden="true" />
      <GlassCard>
        <table className="sr-only">
          <caption>選手別のシュート成功率（3P%、2P%、FT%）</caption>
          <thead><tr><th>選手</th><th>3P%</th><th>2P%</th><th>FT%</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.name}><td>{d.name}</td><td>{d.threePointPct.toFixed(1)}%</td><td>{d.twoPointPct.toFixed(1)}%</td><td>{d.ftPct.toFixed(1)}%</td></tr>
            ))}
          </tbody>
        </table>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 30 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
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
