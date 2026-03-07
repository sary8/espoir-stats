import { notFound } from "next/navigation";
import { getPlayerByNumber, getAllPlayerNumbers, getSeasons, getSeasonsWithData, getAdjacentPlayers } from "@/lib/data";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";

export function generateStaticParams() {
  const seasons = getSeasonsWithData();
  const params: { season: string; number: string }[] = [];
  for (const s of seasons) {
    for (const num of getAllPlayerNumbers(s.id)) {
      params.push({ season: s.id, number: String(num) });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ season: string; number: string }>;
}

export default async function SeasonPlayerPage({ params }: PageProps) {
  const { season, number } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const playerNum = parseInt(number, 10);
  const data = getPlayerByNumber(playerNum, season);

  if (!data) notFound();

  const adjacent = getAdjacentPlayers(playerNum, season);

  return <PlayerDetailClient summary={data.summary} games={data.games} basePath={basePath} seasons={seasons} seasonLabel={seasonInfo.label} seasonId={season} adjacentPlayers={adjacent} />;
}
