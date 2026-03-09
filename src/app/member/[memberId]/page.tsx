import { notFound } from "next/navigation";
import { getMemberById, getAllMemberIds, getSeasons, getDefaultSeason, getAdjacentMembers, getSeasonsWithData, findMemberAcrossSeasons, getPlayerSummaries, getTopPlayers, getRosterPlayers, getGameStats, getAllPlayerSeasonStats } from "@/lib/data";
import { getSeasonAwards, getPlayerAwards } from "@/lib/awards";
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
      return <MemberNotInSeason memberName={cross.name} seasonLabel={seasonLabel} seasons={seasons} memberSeasonIds={cross.seasonIds} />;
    }
    notFound();
  }

  const adjacent = getAdjacentMembers(memberId, season);
  const players = getPlayerSummaries(season);
  const badges = players.length > 0 ? getTopPlayers(players) : undefined;
  const roster = getRosterPlayers(season);
  const games = getGameStats(season);
  const crossSeasonMembers = getAllPlayerSeasonStats();
  const seasonAwards = getSeasonAwards(players, games, roster, crossSeasonMembers);
  const awards = getPlayerAwards(memberId, seasonAwards);
  const crossSeasonData = crossSeasonMembers.find((m) => m.memberId === memberId);

  return <PlayerDetailClient member={data.player} summary={data.summary} games={data.games} seasons={seasons} seasonLabel={seasonLabel} seasonId={season} adjacentPlayers={adjacent} badges={badges} playerAwards={awards} crossSeasonData={crossSeasonData} />;
}
