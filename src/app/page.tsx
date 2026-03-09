import { Suspense } from "react";
import { getPlayerSummaries, getGameStats, getTopPlayers, getSeasons, getDefaultSeason, getMemberList } from "@/lib/data";
import { calcAdvancedStats } from "@/lib/stats";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TeamOverview from "@/components/sections/TeamOverview";
import PlayerCards from "@/components/sections/PlayerCards";
import StatsRanking from "@/components/sections/StatsRanking";
import LazyCharts from "@/components/sections/LazyCharts";

export default function Home() {
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const players = getPlayerSummaries(season);
  const members = getMemberList(season);
  const games = getGameStats(season);

  let totalPoints = 0, total3PM = 0, total3PA = 0, totalRebounds = 0, totalAssists = 0, totalSteals = 0, totalBlocks = 0, totalTurnovers = 0;
  for (const p of players) {
    totalPoints += p.totalPoints; total3PM += p.threePointMade; total3PA += p.threePointAttempt;
    totalAssists += p.assists; totalSteals += p.steals;
    totalBlocks += p.blocks; totalTurnovers += p.turnovers;
  }
  for (const g of games) {
    for (const p of g.players) totalRebounds += p.totalReb;
  }

  const totalGames = games.length;
  const team3pPct = total3PA > 0 ? (total3PM / total3PA) * 100 : 0;

  const parseMin = (min: string): number => {
    if (!min) return 0;
    const parts = min.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
  };

  const addPlayerToTotals = (t: typeof seasonEspoir, p: { threePointMade: number; threePointAttempt: number; twoPointMade: number; twoPointAttempt: number; ftAttempt: number; offReb: number; defReb: number; turnovers: number; points: number; minutes: string }) => {
    t.threePointMade += p.threePointMade; t.threePointAttempt += p.threePointAttempt;
    t.twoPointMade += p.twoPointMade; t.twoPointAttempt += p.twoPointAttempt;
    t.ftAttempt += p.ftAttempt; t.offReb += p.offReb; t.defReb += p.defReb;
    t.turnovers += p.turnovers; t.points += p.points; t.totalMinutes += parseMin(p.minutes);
  };

  const seasonEspoir = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftAttempt: 0, offReb: 0, defReb: 0, turnovers: 0, points: 0, totalMinutes: 0 };
  const seasonOpponent = { threePointMade: 0, threePointAttempt: 0, twoPointMade: 0, twoPointAttempt: 0, ftAttempt: 0, offReb: 0, defReb: 0, turnovers: 0, points: 0, totalMinutes: 0 };
  for (const g of games) {
    for (const p of g.players) addPlayerToTotals(seasonEspoir, p);
    for (const p of g.opponentPlayers) addPlayerToTotals(seasonOpponent, p);
  }
  const seasonAdvanced = calcAdvancedStats(seasonEspoir, seasonOpponent);

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
      <Header seasons={seasons} />
      <main id="main-content">
        <HeroSection
          seasonLabel={seasonLabel}
          totalPoints={totalPoints}
          totalGames={totalGames}
          totalMembers={members.length}
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
          pace={seasonAdvanced.pace}
          offRtg={seasonAdvanced.offRtg}
          defRtg={seasonAdvanced.defRtg}
          netRtg={seasonAdvanced.netRtg}
        />
        <Suspense>
          <LazyCharts
            scoringData={scoringData}
            shootingData={shootingData}
            radarPlayers={radarPlayers}
            games={games.map((g) => ({
              gameId: g.gameId,
              opponent: g.opponent,
              date: g.date,
              players: g.players,
              teamPoints: g.teamPoints,
              youtubeUrl: g.youtubeUrl,
            }))}
          />
        </Suspense>
        <StatsRanking players={players} />
        <PlayerCards
          members={members}
          {...topPlayers}
        />
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
