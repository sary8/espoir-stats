import { notFound } from "next/navigation";
import { getMemberById, getAllMemberIds, getSeasons, getDefaultSeason, getAdjacentMembers } from "@/lib/data";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";

export function generateStaticParams() {
  return getAllMemberIds().map((memberId) => ({
    memberId,
  }));
}

interface PageProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberPage({ params }: PageProps) {
  const { memberId } = await params;
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const data = getMemberById(memberId, season);

  if (!data) notFound();

  const adjacent = getAdjacentMembers(memberId, season);

  return <PlayerDetailClient member={data.player} summary={data.summary} games={data.games} seasons={seasons} seasonLabel={seasonLabel} seasonId={season} adjacentPlayers={adjacent} />;
}
