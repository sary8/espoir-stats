import { getPlayerSummaries, getTopPlayers, getSeasons, getDefaultSeason, getMemberList } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export default function MembersPage() {
  const seasons = getSeasons();
  const season = getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const members = getMemberList(season);
  const topPlayers = getTopPlayers(getPlayerSummaries(season));

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <PlayerCards
          members={members}
          {...topPlayers}
          seasons={seasons}
          currentSeason={season}
        />
      </main>
      <Footer seasonLabel={seasonLabel} />
    </>
  );
}
