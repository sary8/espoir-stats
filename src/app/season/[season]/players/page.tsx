import { notFound } from "next/navigation";
import { getPlayerSummaries, getTopPlayers, getSeasons, getSeasonsWithData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export function generateStaticParams() {
  return getSeasonsWithData().map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonPlayersPage({ params }: PageProps) {
  const { season } = await params;
  const seasons = getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const players = getPlayerSummaries(season);
  const topPlayers = getTopPlayers(players);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <PlayerCards
          players={players}
          {...topPlayers}
          basePath={basePath}
          seasons={seasons}
          currentSeason={season}
        />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
