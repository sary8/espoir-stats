import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPlayerSummaries, getGameStats, getSeasons, getSeasonsWithData, getRosterPlayers } from "@/lib/data";
import PlayerCompareClient from "@/components/sections/PlayerCompareClient";

export async function generateStaticParams() {
  return (await getSeasonsWithData()).map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonPlayerComparePage({ params }: PageProps) {
  const { season } = await params;
  const seasons = await getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const [players, games, roster] = await Promise.all([
    getPlayerSummaries(season),
    getGameStats(season),
    getRosterPlayers(season),
  ]);
  const basePath = `/season/${season}`;

  return (
    <Suspense>
      <PlayerCompareClient
        seasons={seasons}
        players={players}
        games={games}
        roster={roster}
        basePath={basePath}
      />
    </Suspense>
  );
}
