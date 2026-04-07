import { notFound } from "next/navigation";
import { getMemberById, getAllMemberIds, getSeasons, getDefaultSeason, getAdjacentMembers, getSeasonsWithData, findMemberAcrossSeasons, getPlayerSummaries, getTopPlayers, getRosterPlayers, getGameStats, getAllPlayerSeasonStats } from "@/lib/data";
import { getSeasonAwards, getPlayerAwards } from "@/lib/awards";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";
import MemberNotInSeason from "@/components/sections/MemberNotInSeason";

export const revalidate = 3600;

export async function generateStaticParams() {
  const seasons = await getSeasonsWithData();
  const allIds = await Promise.all(seasons.map((s) => getAllMemberIds(s.id)));
  const allMemberIds = new Set(allIds.flat());
  return Array.from(allMemberIds).map((memberId) => ({ memberId }));
}

interface PageProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberPage({ params }: PageProps) {
  const { memberId } = await params;
  const seasons = await getSeasons();
  const season = await getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const data = await getMemberById(memberId, season);

  if (!data) {
    const cross = await findMemberAcrossSeasons(memberId);
    if (cross) {
      return <MemberNotInSeason memberName={cross.name} seasonLabel={seasonLabel} seasons={seasons} memberSeasonIds={cross.seasonIds} />;
    }
    notFound();
  }

  const [adjacent, players, roster, games, crossSeasonMembers] = await Promise.all([
    getAdjacentMembers(memberId, season),
    getPlayerSummaries(season),
    getRosterPlayers(season),
    getGameStats(season),
    getAllPlayerSeasonStats(),
  ]);
  const badges = players.length > 0 ? getTopPlayers(players) : undefined;
  const seasonAwards = getSeasonAwards(players, games, roster, crossSeasonMembers, season);
  const awards = getPlayerAwards(memberId, seasonAwards);
  const crossSeasonData = crossSeasonMembers.find((m) => m.memberId === memberId);

  return <PlayerDetailClient member={data.player} summary={data.summary} games={data.games} seasons={seasons} seasonLabel={seasonLabel} seasonId={season} adjacentPlayers={adjacent} badges={badges} playerAwards={awards} crossSeasonData={crossSeasonData} />;
}
