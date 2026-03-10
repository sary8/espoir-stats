import type { Metadata } from "next";
import { getSeasons, getSeasonsWithData, getAllPlayerSeasonStats, getGameStats, getRosterPlayers } from "@/lib/data";
import { getCareerTotals, getAllTimeSingleGameRecords, getAllMilestones } from "@/lib/records";
import AllTimePageClient from "@/components/sections/AllTimePageClient";

export const metadata: Metadata = {
  title: "All-Time Records | ESPOIR Stats",
};

export default async function AllTimePage() {
  const [seasons, seasonsWithData, crossSeasonMembers] = await Promise.all([
    getSeasons(),
    getSeasonsWithData(),
    getAllPlayerSeasonStats(),
  ]);

  // Pre-fetch all data needed by records functions
  const gamesBySeason = new Map<string, Awaited<ReturnType<typeof getGameStats>>>();
  const rosterBySeason = new Map<string, Awaited<ReturnType<typeof getRosterPlayers>>>();
  await Promise.all(
    seasonsWithData.map(async (s) => {
      const [games, roster] = await Promise.all([
        getGameStats(s.id),
        getRosterPlayers(s.id),
      ]);
      gamesBySeason.set(s.id, games);
      rosterBySeason.set(s.id, roster);
    }),
  );

  const careerTotals = getCareerTotals(crossSeasonMembers);
  const singleGameRecords = getAllTimeSingleGameRecords(
    seasonsWithData,
    (seasonId) => gamesBySeason.get(seasonId) ?? [],
    (seasonId) => rosterBySeason.get(seasonId) ?? [],
  );
  const milestones = getAllMilestones(
    crossSeasonMembers,
    seasonsWithData,
    (seasonId) => gamesBySeason.get(seasonId) ?? [],
  );

  return (
    <AllTimePageClient
      seasons={seasons}
      careerTotals={careerTotals}
      singleGameRecords={singleGameRecords}
      milestones={milestones}
    />
  );
}
