import { getGameStats, getSeasons, getDefaultSeason } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameList from "@/components/sections/GameList";

export default async function GamesPage() {
  const seasons = await getSeasons();
  const season = await getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const games = await getGameStats(season);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameList games={games} seasons={seasons} currentSeason={season} />
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
