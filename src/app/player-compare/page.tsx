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

  const gamePoints = games.map((g) => ({
    opponent: g.opponent,
    players: g.players.map((p) => ({ number: p.number, points: p.points })),
  }));

  return (
    <Suspense>
      <PlayerCompareClient
        seasons={seasons}
        players={players}
        gamePoints={gamePoints}
        roster={roster}
      />
    </Suspense>
  );
}
