"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { tooltipStyle, tooltipLabelStyle, chartColors } from "@/config/theme";

interface SeasonsBarChartProps {
  data: { season: string; avgPoints: number; rebounds: number; assists: number }[];
}

export default function SeasonsBarChart({ data }: SeasonsBarChartProps) {
  return (
    <>
      <table className="sr-only">
        <caption>シーズンごとのチーム平均得点・リバウンド・アシスト</caption>
        <thead><tr><th>シーズン</th><th>平均得点</th><th>リバウンド</th><th>アシスト</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.season}><td>{d.season}</td><td>{d.avgPoints}</td><td>{d.rebounds}</td><td>{d.assists}</td></tr>
          ))}
        </tbody>
      </table>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="season" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
          <Legend />
          <Bar dataKey="avgPoints" name="平均得点" fill={chartColors.purple} radius={[4, 4, 0, 0]} />
          <Bar dataKey="rebounds" name="リバウンド" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
          <Bar dataKey="assists" name="アシスト" fill={chartColors.green} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
