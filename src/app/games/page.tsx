import { getGameStats } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameList from "@/components/sections/GameList";

export default function GamesPage() {
  const games = getGameStats();

  return (
    <>
      <Header />
      <main id="main-content" className="pt-16">
        <GameList games={games} />
      </main>
      <Footer />
    </>
  );
}
