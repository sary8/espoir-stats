import { notFound } from "next/navigation";
import { getGameByOpponent, getAllOpponents, getSeasons, getSeasonsWithData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameDetailClient from "@/components/sections/GameDetailClient";

export function generateStaticParams() {
  const seasons = getSeasonsWithData();
  const params: { season: string; opponent: string }[] = [];
  for (const s of seasons) {
    for (const opp of getAllOpponents(s.id)) {
      params.push({ season: s.id, opponent: opp });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ season: string; opponent: string }>;
}

export default async function SeasonGameDetailPage({ params }: PageProps) {
  const { season, opponent } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const decoded = decodeURIComponent(opponent);
  const game = getGameByOpponent(decoded, season);

  if (!game) notFound();

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameDetailClient game={game} basePath={basePath} />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
