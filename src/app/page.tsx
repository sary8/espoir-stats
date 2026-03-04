import { getPlayerSummaries, getGameStats } from "@/lib/data";
import ClientSections from "@/components/sections/ClientSections";

export default function Home() {
  const players = getPlayerSummaries();
  const games = getGameStats();

  const totalPoints = players.reduce((s, p) => s + p.totalPoints, 0);
  const totalGames = 4;
  const total3PM = players.reduce((s, p) => s + p.threePointMade, 0);
  const total3PA = players.reduce((s, p) => s + p.threePointAttempt, 0);
  const team3pPct = total3PA > 0 ? (total3PM / total3PA) * 100 : 0;
  const totalRebounds = players.reduce((s, p) => s + p.totalReb, 0);
  const totalAssists = players.reduce((s, p) => s + p.assists, 0);
  const totalSteals = players.reduce((s, p) => s + p.steals, 0);

  const topScorer = [...players].sort((a, b) => b.ppg - a.ppg)[0].number;
  const topRebounder = [...players].sort((a, b) => b.totalReb - a.totalReb)[0].number;
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0].number;

  return (
    <ClientSections
      players={players}
      games={games}
      teamStats={{
        totalPoints,
        avgPoints: totalPoints / totalGames,
        team3pPct,
        totalRebounds,
        totalAssists,
        totalSteals,
        totalGames,
      }}
      topScorer={topScorer}
      topRebounder={topRebounder}
      topAssister={topAssister}
    />
  );
}
