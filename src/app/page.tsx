import { Suspense, lazy } from "react";
import { getPlayerSummaries, getGameStats } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TeamOverview from "@/components/sections/TeamOverview";
import PlayerCards from "@/components/sections/PlayerCards";
import LazyCharts from "@/components/sections/LazyCharts";

export default function Home() {
  const players = getPlayerSummaries();
  const games = getGameStats();

  let totalPoints = 0;
  let total3PM = 0;
  let total3PA = 0;
  let totalRebounds = 0;
  let totalAssists = 0;
  let totalSteals = 0;
  for (const p of players) {
    totalPoints += p.totalPoints;
    total3PM += p.threePointMade;
    total3PA += p.threePointAttempt;
    totalRebounds += p.totalReb;
    totalAssists += p.assists;
    totalSteals += p.steals;
  }

  const totalGames = 4;
  const team3pPct = total3PA > 0 ? (total3PM / total3PA) * 100 : 0;

  const sortedByPpg = [...players].sort((a, b) => b.ppg - a.ppg);
  const topScorer = sortedByPpg[0].number;
  const topRebounder = [...players].sort((a, b) => b.totalReb - a.totalReb)[0].number;
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0].number;

  const scoringData = sortedByPpg.map((p) => ({ name: p.name, ppg: p.ppg, number: p.number }));

  const shootingData = sortedByPpg.map((p) => ({
    name: p.name.split(" ").pop()!,
    threePointPct: p.threePointPct ?? 0,
    twoPointPct: p.twoPointPct ?? 0,
    ftPct: p.ftPct ?? 0,
  }));

  const radarPlayers = players.map((p) => ({
    number: p.number,
    name: p.name,
    ppg: p.ppg,
    rpg: p.totalReb / p.games,
    apg: p.assists / p.games,
    spg: p.steals / p.games,
    bpg: p.blocks / p.games,
  }));

  return (
    <>
      <Header />
      <main>
        <HeroSection
          totalPoints={totalPoints}
          totalGames={totalGames}
          totalPlayers={players.length}
        />
        <TeamOverview
          totalPoints={totalPoints}
          avgPoints={totalPoints / totalGames}
          team3pPct={team3pPct}
          totalRebounds={totalRebounds}
          totalAssists={totalAssists}
          totalSteals={totalSteals}
        />
        <LazyCharts
          scoringData={scoringData}
          shootingData={shootingData}
          radarPlayers={radarPlayers}
          games={games}
        />
        <PlayerCards
          players={players}
          topScorer={topScorer}
          topRebounder={topRebounder}
          topAssister={topAssister}
        />
      </main>
      <Footer />
    </>
  );
}
