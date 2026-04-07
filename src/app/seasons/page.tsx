import { Suspense } from "react";
import { getSeasons, getAllTeamSeasonStats, getAllPlayerSeasonStats } from "@/lib/data";
import SeasonsPageClient from "@/components/sections/SeasonsPageClient";

export const revalidate = 3600;

export default async function SeasonsPage() {
  const seasons = await getSeasons();
  const teamStats = await getAllTeamSeasonStats();
  const playerStats = await getAllPlayerSeasonStats();

  return (
    <Suspense>
      <SeasonsPageClient
        seasons={seasons}
        teamStats={teamStats}
        playerStats={playerStats}
      />
    </Suspense>
  );
}
