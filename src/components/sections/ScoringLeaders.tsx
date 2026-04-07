"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import { chartColors, tooltipStyle, tooltipLabelStyle } from "@/config/theme";

const tooltipItemStyle = { color: "#A855F7" } as const;

interface ScoringLeadersProps {
  data: { name: string; ppg: number; number: number }[];
}

export default function ScoringLeaders({ data }: ScoringLeadersProps) {
  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="font-display text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center uppercase tracking-wider">
        Scoring <span className="text-accent-purple">Leaders</span>
      </h2>
      <div className="court-divider mb-6 sm:mb-8" aria-hidden="true" />
      <GlassCard>
        <p className="sr-only">選手別の平均得点を示す横棒グラフ。{data.map((d) => `${d.name}: ${d.ppg} PPG`).join("、")}。</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
            <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value) => [`${value} PPG`, "平均得点"]}
              cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
            />
            <Bar dataKey="ppg" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={chartColors.purple} fillOpacity={1 - i * 0.08} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </AnimatedSection>
  );
}
