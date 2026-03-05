import { getPlayerSummaries } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export default function PlayersPage() {
  const players = getPlayerSummaries();

  const topScorer = [...players].sort((a, b) => b.ppg - a.ppg)[0].number;
  const topRebounder = [...players].sort((a, b) => b.totalReb - a.totalReb)[0].number;
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0].number;
  const top3P = [...players].sort((a, b) => b.threePointMade - a.threePointMade)[0].number;
  const topStealer = [...players].sort((a, b) => b.steals - a.steals)[0].number;
  const topBlocker = [...players].sort((a, b) => b.blocks - a.blocks)[0].number;
  const topFoul = [...players].sort((a, b) => b.personalFouls - a.personalFouls)[0].number;
  const topTurnover = [...players].sort((a, b) => b.turnovers - a.turnovers)[0].number;

  return (
    <>
      <Header />
      <main className="pt-16">
        <PlayerCards
          players={players}
          topScorer={topScorer}
          topRebounder={topRebounder}
          topAssister={topAssister}
          top3P={top3P}
          topStealer={topStealer}
          topBlocker={topBlocker}
          topFoul={topFoul}
          topTurnover={topTurnover}
        />
      </main>
      <Footer />
    </>
  );
}
