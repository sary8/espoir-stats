import { Suspense } from "react";
import { getPlayerSummaries, getGameStats, getSeasons, getDefaultSeason, getRosterPlayers } from "@/lib/data";
import PlayerCompareClient from "@/components/sections/PlayerCompareClient";

export default function PlayerComparePage() {
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const players = getPlayerSummaries(season);
  const games = getGameStats(season);
  const roster = getRosterPlayers(season);

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
