import { notFound } from "next/navigation";
import { getGameById, getAllGameIds, getSeasons, getDefaultSeason, getAdjacentGames, findGameAcrossSeasons } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameDetailClient from "@/components/sections/GameDetailClient";
import GameNotInSeason from "@/components/sections/GameNotInSeason";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllGameIds()).map((gameId) => ({
    gameId,
  }));
}

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { gameId } = await params;
  const seasons = await getSeasons();
  const season = await getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const decodedGameId = decodeURIComponent(gameId);
  const game = await getGameById(decodedGameId, season);

  if (!game) {
    const cross = await findGameAcrossSeasons(decodedGameId);
    if (cross) {
      return <GameNotInSeason opponent={cross.opponent} seasonLabel={seasonLabel} seasons={seasons} gameSeasonIds={cross.seasonIds} />;
    }
    notFound();
  }

  const adjacent = await getAdjacentGames(decodedGameId, season);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameDetailClient game={game} adjacentGames={adjacent} />
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
