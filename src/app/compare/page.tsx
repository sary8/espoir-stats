import { Suspense } from "react";
import type { Metadata } from "next";
import { getSeasons, getAllTeamSeasonStats, getAllPlayerSeasonStats } from "@/lib/data";
import SeasonCompareClient from "@/components/sections/SeasonCompareClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Season Compare | ESPOIR Stats",
  description: "シーズン横断でチーム・個人のスタッツを比較",
};

export default async function ComparePage() {
  const seasons = await getSeasons();
  const teamStats = await getAllTeamSeasonStats();
  const playerStats = await getAllPlayerSeasonStats();

  return (
    <Suspense>
      <SeasonCompareClient seasons={seasons} teamStats={teamStats} playerStats={playerStats} />
    </Suspense>
  );
}
