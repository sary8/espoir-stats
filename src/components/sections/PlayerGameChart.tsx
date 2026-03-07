"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { tooltipStyle, tooltipLabelStyle } from "@/config/theme";

interface PlayerGameChartProps {
  data: { game: string; PTS: number; REB: number; AST: number }[];
}

export default function PlayerGameChart({ data }: PlayerGameChartProps) {
  return (
    <>
    <p className="sr-only">試合ごとの得点・リバウンド・アシストの推移を示す折れ線グラフ。</p>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="game" tick={{ fontSize: 10 }} interval={0} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
        />
        <Line type="monotone" dataKey="PTS" stroke="#F472B6" strokeWidth={3} dot={{ r: 5, fill: "#F472B6" }} />
        <Line type="monotone" dataKey="REB" stroke="#22D3EE" strokeWidth={2} dot={{ r: 4, fill: "#22D3EE" }} />
        <Line type="monotone" dataKey="AST" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4, fill: "#FBBF24" }} />
      </LineChart>
    </ResponsiveContainer>
    </>
  );
}
