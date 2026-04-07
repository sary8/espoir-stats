import { notFound } from "next/navigation";
import { getGameStats, getSeasons, getSeasonsWithData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameList from "@/components/sections/GameList";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getSeasonsWithData()).map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonGamesPage({ params }: PageProps) {
  const { season } = await params;
  const seasons = await getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const games = await getGameStats(season);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameList games={games} basePath={basePath} seasons={seasons} currentSeason={season} />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
