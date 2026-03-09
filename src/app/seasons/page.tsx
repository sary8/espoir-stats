import { getSeasons, getAllTeamSeasonStats, getAllPlayerSeasonStats } from "@/lib/data";
import SeasonsPageClient from "@/components/sections/SeasonsPageClient";

export default async function SeasonsPage() {
  const seasons = await getSeasons();
  const teamStats = await getAllTeamSeasonStats();
  const playerStats = await getAllPlayerSeasonStats();

  return (
    <SeasonsPageClient
      seasons={seasons}
      teamStats={teamStats}
      playerStats={playerStats}
    />
  );
}
