import { notFound } from "next/navigation";
import { getMemberById, getAllMemberIds, getSeasons, getDefaultSeason, getAdjacentMembers, getSeasonsWithData, findMemberAcrossSeasons, getPlayerSummaries, getTopPlayers } from "@/lib/data";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";
import MemberNotInSeason from "@/components/sections/MemberNotInSeason";

export function generateStaticParams() {
  const seasons = getSeasonsWithData();
  const allMemberIds = new Set<string>();
  for (const s of seasons) {
    for (const id of getAllMemberIds(s.id)) {
      allMemberIds.add(id);
    }
  }
  return Array.from(allMemberIds).map((memberId) => ({ memberId }));
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

  if (!data) {
    const cross = findMemberAcrossSeasons(memberId);
    if (cross) {
      return <MemberNotInSeason memberName={cross.name} seasonLabel={seasonLabel} seasons={seasons} />;
    }
    notFound();
  }

  const adjacent = getAdjacentMembers(memberId, season);
  const players = getPlayerSummaries(season);
  const badges = players.length > 0 ? getTopPlayers(players) : undefined;

  return <PlayerDetailClient member={data.player} summary={data.summary} games={data.games} seasons={seasons} seasonLabel={seasonLabel} seasonId={season} adjacentPlayers={adjacent} badges={badges} />;
}
