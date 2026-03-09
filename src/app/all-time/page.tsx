import type { Metadata } from "next";
import { getSeasons, getSeasonsWithData, getAllPlayerSeasonStats, getGameStats, getRosterPlayers } from "@/lib/data";
import { getCareerTotals, getAllTimeSingleGameRecords, getAllMilestones } from "@/lib/records";
import AllTimePageClient from "@/components/sections/AllTimePageClient";

export const metadata: Metadata = {
  title: "All-Time Records | ESPOIR Stats",
};

export default async function AllTimePage() {
  const seasons = await getSeasons();
  const seasonsWithData = await getSeasonsWithData();
  const crossSeasonMembers = await getAllPlayerSeasonStats();

  // Pre-fetch all data needed by records functions
  const gamesBySeason = new Map<string, Awaited<ReturnType<typeof getGameStats>>>();
  const rosterBySeason = new Map<string, Awaited<ReturnType<typeof getRosterPlayers>>>();
  for (const s of seasonsWithData) {
    gamesBySeason.set(s.id, await getGameStats(s.id));
    rosterBySeason.set(s.id, await getRosterPlayers(s.id));
  }

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
