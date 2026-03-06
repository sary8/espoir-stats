import { getPlayerSummaries, getTopPlayers } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export default function PlayersPage() {
  const players = getPlayerSummaries();
  const topPlayers = getTopPlayers(players);

  return (
    <>
      <Header />
      <main id="main-content" className="pt-16">
        <PlayerCards
          players={players}
          {...topPlayers}
        />
      </main>
      <Footer />
    </>
  );
}
