import { notFound } from "next/navigation";
import { getGameByOpponent, getAllOpponents, getSeasons, getDefaultSeason, getAdjacentGames } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameDetailClient from "@/components/sections/GameDetailClient";

export function generateStaticParams() {
  return getAllOpponents().map((opponent) => ({
    opponent,
  }));
}

interface PageProps {
  params: Promise<{ opponent: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { opponent } = await params;
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const decoded = decodeURIComponent(opponent);
  const game = getGameByOpponent(decoded, season);

  if (!game) notFound();

  const adjacent = getAdjacentGames(decoded, season);

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
