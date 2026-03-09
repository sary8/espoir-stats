import type { Metadata } from "next";
import { getSeasons, getSeasonsWithData, getAllPlayerSeasonStats, getGameStats, getRosterPlayers } from "@/lib/data";
import { getCareerTotals, getAllTimeSingleGameRecords, getAllMilestones } from "@/lib/records";
import AllTimePageClient from "@/components/sections/AllTimePageClient";

export const metadata: Metadata = {
  title: "All-Time Records | ESPOIR Stats",
};

export default function AllTimePage() {
  const seasons = getSeasons();
  const seasonsWithData = getSeasonsWithData();
  const crossSeasonMembers = getAllPlayerSeasonStats();

  const careerTotals = getCareerTotals(crossSeasonMembers);
  const singleGameRecords = getAllTimeSingleGameRecords(
    seasonsWithData,
    getGameStats,
    getRosterPlayers,
  );
  const milestones = getAllMilestones(
    crossSeasonMembers,
    seasonsWithData,
    getGameStats,
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
