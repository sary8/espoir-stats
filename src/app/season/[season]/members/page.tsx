import { notFound } from "next/navigation";
import { getPlayerSummaries, getTopPlayers, getSeasons, getSeasonsWithData, getMemberList } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerCards from "@/components/sections/PlayerCards";

export async function generateStaticParams() {
  return (await getSeasonsWithData()).map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonMembersPage({ params }: PageProps) {
  const { season } = await params;
  const seasons = await getSeasons();
  const seasonInfo = seasons.find((s) => s.id === season);
  if (!seasonInfo) notFound();

  const basePath = `/season/${season}`;
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
          <div className="absolute inset-0 bg-background/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-wider">
              Team <span className="text-accent-purple">Members</span>
            </h1>
          </div>
        </section>
        <PlayerCards
          members={members}
          {...topPlayers}
          basePath={basePath}
          seasons={seasons}
          currentSeason={season}
        />
      </main>
      <Footer seasonLabel={seasonInfo.label} />
    </>
  );
}
