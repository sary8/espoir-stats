import { notFound } from "next/navigation";
import { getMemberById, getAllMemberIds, getSeasons, getSeasonsWithData, getAdjacentMembers } from "@/lib/data";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";

export function generateStaticParams() {
  const seasons = getSeasonsWithData();
  const params: { season: string; memberId: string }[] = [];
  for (const s of seasons) {
    for (const memberId of getAllMemberIds(s.id)) {
      params.push({ season: s.id, memberId });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ season: string; memberId: string }>;
}

export default async function SeasonMemberPage({ params }: PageProps) {
  const { season, memberId } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const data = getMemberById(memberId, season);

  if (!data) notFound();

  const adjacent = getAdjacentMembers(memberId, season);

  return <PlayerDetailClient member={data.player} summary={data.summary} games={data.games} basePath={basePath} seasons={seasons} seasonLabel={seasonInfo.label} seasonId={season} adjacentPlayers={adjacent} />;
}
