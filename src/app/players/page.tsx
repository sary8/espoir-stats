import { getPlayerSummaries, getTopPlayers, getSeasons, getDefaultSeason, getPlayerList } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export default function PlayersPage() {
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const players = getPlayerList(season);
  const topPlayers = getTopPlayers(getPlayerSummaries(season));

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <PlayerCards
          players={players}
          {...topPlayers}
          seasons={seasons}
          currentSeason={season}
        />
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
