import { notFound } from "next/navigation";
import { getGameById, getAllGameIds, getSeasons, getSeasonsWithData, getAdjacentGames, findGameAcrossSeasons } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameDetailClient from "@/components/sections/GameDetailClient";
import GameNotInSeason from "@/components/sections/GameNotInSeason";

export function generateStaticParams() {
  const seasons = getSeasonsWithData();
  const allGameIds = new Set<string>();
  const params: { season: string; gameId: string }[] = [];
  for (const s of seasons) {
    for (const gameId of getAllGameIds(s.id)) {
      params.push({ season: s.id, gameId });
      allGameIds.add(gameId);
    }
  }
  for (const s of seasons) {
    for (const gameId of allGameIds) {
      if (!params.some((p) => p.season === s.id && p.gameId === gameId)) {
        params.push({ season: s.id, gameId });
      }
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ season: string; gameId: string }>;
}

export default async function SeasonGameDetailPage({ params }: PageProps) {
  const { season, gameId } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const decodedGameId = decodeURIComponent(gameId);
  const game = getGameById(decodedGameId, season);

  if (!game) {
    const cross = findGameAcrossSeasons(decodedGameId);
    if (cross) {
      return <GameNotInSeason opponent={cross.opponent} seasonLabel={seasonInfo.label} seasons={seasons} basePath={basePath} gameSeasonIds={cross.seasonIds} />;
    }
    notFound();
  }

  const adjacent = getAdjacentGames(decodedGameId, season);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameDetailClient game={game} basePath={basePath} adjacentGames={adjacent} />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
