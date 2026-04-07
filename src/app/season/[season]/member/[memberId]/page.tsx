import { notFound } from "next/navigation";
import { getMemberById, getAllMemberIds, getSeasons, getSeasonsWithData, getAdjacentMembers, findMemberAcrossSeasons, getPlayerSummaries, getTopPlayers, getRosterPlayers, getGameStats, getAllPlayerSeasonStats } from "@/lib/data";
import { getSeasonAwards, getPlayerAwards } from "@/lib/awards";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";
import MemberNotInSeason from "@/components/sections/MemberNotInSeason";

export const revalidate = 3600;

export async function generateStaticParams() {
  const seasons = await getSeasonsWithData();
  const allIds = await Promise.all(seasons.map((s) => getAllMemberIds(s.id)));
  const params: { season: string; memberId: string }[] = [];
  for (let i = 0; i < seasons.length; i++) {
    for (const memberId of allIds[i]) {
      params.push({ season: seasons[i].id, memberId });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ season: string; memberId: string }>;
}

export default async function SeasonMemberPage({ params }: PageProps) {
  const { season, memberId } = await params;
  const seasons = await getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const data = await getMemberById(memberId, season);

  if (!data) {
    const cross = await findMemberAcrossSeasons(memberId);
    if (cross) {
      return <MemberNotInSeason memberName={cross.name} seasonLabel={seasonInfo.label} seasons={seasons} basePath={basePath} memberSeasonIds={cross.seasonIds} />;
    }
    notFound();
  }

  const [adjacent, players, roster, gameStats, crossSeasonMembers] = await Promise.all([
    getAdjacentMembers(memberId, season),
    getPlayerSummaries(season),
    getRosterPlayers(season),
    getGameStats(season),
    getAllPlayerSeasonStats(),
  ]);
  const badges = players.length > 0 ? getTopPlayers(players) : undefined;
  const seasonAwards = getSeasonAwards(players, gameStats, roster, crossSeasonMembers, season);
  const awards = getPlayerAwards(memberId, seasonAwards);
  const crossSeasonData = crossSeasonMembers.find((m) => m.memberId === memberId);

  return <PlayerDetailClient member={data.player} summary={data.summary} games={data.games} basePath={basePath} seasons={seasons} seasonLabel={seasonInfo.label} seasonId={season} adjacentPlayers={adjacent} badges={badges} playerAwards={awards} crossSeasonData={crossSeasonData} />;
}
