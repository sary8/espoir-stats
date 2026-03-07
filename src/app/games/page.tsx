import { getGameStats, getSeasons, getDefaultSeason } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameList from "@/components/sections/GameList";

export default function GamesPage() {
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const games = getGameStats(season);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GameList games={games} />
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
