import { notFound } from "next/navigation";
import { getPlayerByNumber, getAllPlayerNumbers, getSeasons, getDefaultSeason } from "@/lib/data";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";

export function generateStaticParams() {
  return getAllPlayerNumbers().map((number) => ({
    number: String(number),
  }));
}

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { number } = await params;
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const playerNum = parseInt(number, 10);
  const data = getPlayerByNumber(playerNum, season);

  if (!data) notFound();

  return <PlayerDetailClient summary={data.summary} games={data.games} seasons={seasons} seasonLabel={seasonLabel} seasonId={season} />;
}
