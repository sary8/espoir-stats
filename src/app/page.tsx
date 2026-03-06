import { getPlayerSummaries, getGameStats, getTopPlayers } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TeamOverview from "@/components/sections/TeamOverview";
import PlayerCards from "@/components/sections/PlayerCards";
import StatsRanking from "@/components/sections/StatsRanking";
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
  let totalBlocks = 0;
  let totalTurnovers = 0;
  for (const p of players) {
    totalPoints += p.totalPoints;
    total3PM += p.threePointMade;
    total3PA += p.threePointAttempt;
    totalRebounds += p.totalReb;
    totalAssists += p.assists;
    totalSteals += p.steals;
    totalBlocks += p.blocks;
    totalTurnovers += p.turnovers;
  }

  const totalGames = games.length;
  const team3pPct = total3PA > 0 ? (total3PM / total3PA) * 100 : 0;

  const topPlayers = getTopPlayers(players);

  const sortedByPpg = [...players].sort((a, b) => b.ppg - a.ppg);
  const sortedByNumber = [...players].sort((a, b) => a.number - b.number);

  const scoringData = sortedByPpg.map((p) => ({ name: p.name.split(" ").pop()!, ppg: p.ppg, number: p.number }));

  const shootingData = sortedByNumber.map((p) => ({
    name: p.name.split(" ").pop()!,
    threePointPct: p.threePointPct ?? 0,
    twoPointPct: p.twoPointPct ?? 0,
    ftPct: p.ftPct ?? 0,
  }));

  const radarPlayers = sortedByNumber.map((p) => ({
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
          totalBlocks={totalBlocks}
          totalTurnovers={totalTurnovers}
        />
        <LazyCharts
          scoringData={scoringData}
          shootingData={shootingData}
          radarPlayers={radarPlayers}
          games={games.map(({ opponentPlayers, opponentPoints, ...rest }) => rest)}
        />
        <PlayerCards
          players={players}
          {...topPlayers}
        />
        <StatsRanking players={players} />
      </main>
      <Footer />
    </>
  );
}
