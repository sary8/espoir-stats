"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { tooltipStyle, tooltipLabelStyle, chartColors } from "@/config/theme";

interface PlayerCompareChartProps {
  data: { game: string; p1Pts: number | null; p2Pts: number | null }[];
  p1Name: string;
  p2Name: string;
}

export default function PlayerCompareChart({ data, p1Name, p2Name }: PlayerCompareChartProps) {
  return (
    <>
      <p className="sr-only">{p1Name}と{p2Name}の試合ごと得点推移を示す折れ線グラフ。</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="game" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
          <Legend />
          <Line type="monotone" dataKey="p1Pts" name={p1Name} stroke={chartColors.purple} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.purple }} connectNulls />
          <Line type="monotone" dataKey="p2Pts" name={p2Name} stroke={chartColors.cyan} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.cyan }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
