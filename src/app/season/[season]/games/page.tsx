import { notFound } from "next/navigation";
import { getGameStats, getSeasons, getSeasonsWithData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameList from "@/components/sections/GameList";

export function generateStaticParams() {
  return getSeasonsWithData().map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonGamesPage({ params }: PageProps) {
  const { season } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const games = getGameStats(season);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameList games={games} basePath={basePath} />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
