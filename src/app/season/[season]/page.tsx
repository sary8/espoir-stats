import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPlayerSummaries, getGameStats, getSeasons, getSeasonsWithData, getMemberList, getRosterPlayers, getAllPlayerSeasonStats } from "@/lib/data";
import { calcAdvancedStats } from "@/lib/stats";
import { getSeasonAwards } from "@/lib/awards";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TeamOverview from "@/components/sections/TeamOverview";
import StatsRanking from "@/components/sections/StatsRanking";
import LazyCharts from "@/components/sections/LazyCharts";
import SeasonAwards from "@/components/sections/SeasonAwards";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getSeasonsWithData()).map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonHome({ params }: PageProps) {
  const { season } = await params;
  const seasons = await getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
  const [players, members, games, roster, crossSeasonMembers] = await Promise.all([
    getPlayerSummaries(season),
    getMemberList(season),
    getGameStats(season),
    getRosterPlayers(season),
    getAllPlayerSeasonStats(),
  ]);
  const seasonAwards = getSeasonAwards(players, games, roster, crossSeasonMembers, season);

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

  const scoringData = [...players].sort((a, b) => b.ppg - a.ppg)
    .map((p) => ({ name: p.name.split(" ").pop()!, ppg: p.ppg, number: p.number }));

  const sortedByNumber = [...players].sort((a, b) => a.number - b.number);
  const shootingData: { name: string; threePointPct: number; twoPointPct: number; ftPct: number }[] = [];
  const radarPlayers: { number: number; name: string; ppg: number; rpg: number; apg: number; spg: number; bpg: number }[] = [];
  for (const p of sortedByNumber) {
    const shortName = p.name.split(" ").pop()!;
    shootingData.push({ name: shortName, threePointPct: p.threePointPct ?? 0, twoPointPct: p.twoPointPct ?? 0, ftPct: p.ftPct ?? 0 });
    const g = p.games || 1;
    radarPlayers.push({ number: p.number, name: p.name, ppg: p.ppg, rpg: p.totalReb / g, apg: p.assists / g, spg: p.steals / g, bpg: p.blocks / g });
  }

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content">
        <HeroSection
          seasonLabel={seasonInfo.label}
          totalPoints={totalPoints}
          totalGames={totalGames}
          totalMembers={members.length}
        />
        <TeamOverview
          totalPoints={totalPoints}
          avgPoints={totalGames > 0 ? totalPoints / totalGames : 0}
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
        <Suspense fallback={null}>
          <LazyCharts
            scoringData={scoringData}
            shootingData={shootingData}
            radarPlayers={radarPlayers}
            games={games.map((g) => ({
              gameId: g.gameId,
              opponent: g.opponent,
              date: g.date,
              players: g.players.map((p) => ({
                number: p.number, name: p.name, starter: p.starter, points: p.points,
                threePointMade: p.threePointMade, threePointAttempt: p.threePointAttempt,
                twoPointMade: p.twoPointMade, twoPointAttempt: p.twoPointAttempt,
                ftMade: p.ftMade, ftAttempt: p.ftAttempt,
                offReb: p.offReb, defReb: p.defReb, totalReb: p.totalReb,
                assists: p.assists, steals: p.steals, blocks: p.blocks, turnovers: p.turnovers,
                personalFouls: p.personalFouls, foulsDrawn: p.foulsDrawn, minutes: p.minutes,
              })),
            }))}
          />
        </Suspense>
        <SeasonAwards awards={seasonAwards} basePath={basePath} />
        <StatsRanking players={players} />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
