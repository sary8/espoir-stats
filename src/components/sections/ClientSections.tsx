"use client";

import Header from "../layout/Header";
import HeroSection from "./HeroSection";
import TeamOverview from "./TeamOverview";
import PlayerCards from "./PlayerCards";
import ScoringLeaders from "./ScoringLeaders";
import ShootingChart from "./ShootingChart";
import PlayerRadar from "./PlayerRadar";
import GameBreakdown from "./GameBreakdown";
import Footer from "../layout/Footer";
import type { PlayerSummary, GameResult } from "@/lib/types";

interface ClientSectionsProps {
  players: PlayerSummary[];
  games: GameResult[];
  teamStats: {
    totalPoints: number;
    avgPoints: number;
    team3pPct: number;
    totalRebounds: number;
    totalAssists: number;
    totalSteals: number;
    totalGames: number;
  };
  topScorer: number;
  topRebounder: number;
  topAssister: number;
}

export default function ClientSections({ players, games, teamStats, topScorer, topRebounder, topAssister }: ClientSectionsProps) {
  return (
    <>
      <Header />
      <main>
        <HeroSection
          totalPoints={teamStats.totalPoints}
          totalGames={teamStats.totalGames}
          totalPlayers={players.length}
        />
        <TeamOverview {...teamStats} />
        <ScoringLeaders players={players} />
        <PlayerCards
          players={players}
          topScorer={topScorer}
          topRebounder={topRebounder}
          topAssister={topAssister}
        />
        <ShootingChart players={players} />
        <PlayerRadar players={players} />
        <GameBreakdown games={games} />
      </main>
      <Footer />
    </>
  );
}
