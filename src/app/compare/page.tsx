import type { Metadata } from "next";
import { getSeasons, getAllTeamSeasonStats, getAllPlayerSeasonStats } from "@/lib/data";
import SeasonCompareClient from "@/components/sections/SeasonCompareClient";

export const metadata: Metadata = {
  title: "Season Compare | ESPOIR Stats",
  description: "シーズン横断でチーム・個人のスタッツを比較",
};

export default function ComparePage() {
  const seasons = getSeasons();
  const teamStats = getAllTeamSeasonStats();
  const playerStats = getAllPlayerSeasonStats();

  return <SeasonCompareClient seasons={seasons} teamStats={teamStats} playerStats={playerStats} />;
}
