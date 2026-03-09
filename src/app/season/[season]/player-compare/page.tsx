import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPlayerSummaries, getGameStats, getSeasons, getSeasonsWithData, getRosterPlayers } from "@/lib/data";
import PlayerCompareClient from "@/components/sections/PlayerCompareClient";

export function generateStaticParams() {
  return getSeasonsWithData().map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonPlayerComparePage({ params }: PageProps) {
  const { season } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const players = getPlayerSummaries(season);
  const games = getGameStats(season);
  const roster = getRosterPlayers(season);
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
