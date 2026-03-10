import { getPlayerSummaries, getTopPlayers, getSeasons, getDefaultSeason, getMemberList } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export default async function MembersPage() {
  const seasons = await getSeasons();
  const season = await getDefaultSeason();
  const seasonLabel = seasons.find((s) => s.id === season)?.label ?? season;
  const [members, summaries] = await Promise.all([
    getMemberList(season),
    getPlayerSummaries(season),
  ]);
  const topPlayers = getTopPlayers(summaries);

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <section className="relative gradient-mesh py-12 sm:py-20">
          <div className="absolute inset-0 bg-[#0a0a0f]/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Team <span className="text-accent-purple">Members</span>
            </h1>
          </div>
        </section>
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
