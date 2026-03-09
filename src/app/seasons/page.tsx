import { getSeasons, getAllTeamSeasonStats, getAllPlayerSeasonStats } from "@/lib/data";
import SeasonsPageClient from "@/components/sections/SeasonsPageClient";

export default function SeasonsPage() {
  const seasons = getSeasons();
  const teamStats = getAllTeamSeasonStats();
  const playerStats = getAllPlayerSeasonStats();

  return (
    <SeasonsPageClient
      seasons={seasons}
      teamStats={teamStats}
      playerStats={playerStats}
    />
  );
}
