import { Suspense } from "react";
import { getPlayerSummaries, getGameStats, getSeasons, getDefaultSeason, getRosterPlayers } from "@/lib/data";
import PlayerCompareClient from "@/components/sections/PlayerCompareClient";

export default async function PlayerComparePage() {
  const seasons = await getSeasons();
  const season = await getDefaultSeason();
  const [players, games, roster] = await Promise.all([
    getPlayerSummaries(season),
    getGameStats(season),
    getRosterPlayers(season),
  ]);

  return (
    <Suspense>
      <PlayerCompareClient
        seasons={seasons}
        players={players}
        games={games}
        roster={roster}
      />
    </Suspense>
  );
}
