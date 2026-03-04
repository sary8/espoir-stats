"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";
import { playerColors } from "@/config/theme";

const tooltipStyle = {
  background: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
} as const;
const tooltipLabelStyle = { color: "#fff" } as const;
const tooltipItemStyle = { color: "#f97316" } as const;

interface ScoringLeadersProps {
  data: { name: string; ppg: number; number: number }[];
}

export default function ScoringLeaders({ data }: ScoringLeadersProps) {
  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        Scoring <span className="text-accent-orange">Leaders</span>
      </h2>
      <GlassCard>
        <p className="sr-only">選手別の平均得点を示す横棒グラフ。{data.map((d) => `${d.name}: ${d.ppg} PPG`).join("、")}。</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
            <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value) => [`${value} PPG`, "平均得点"]}
            />
            <Bar dataKey="ppg" radius={[0, 6, 6, 0]} barSize={20}>
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
