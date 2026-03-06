import { notFound } from "next/navigation";
import { getGameByOpponent, getAllOpponents } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameDetailClient from "@/components/sections/GameDetailClient";

export function generateStaticParams() {
  return getAllOpponents().map((opponent) => ({
    opponent,
  }));
}

interface PageProps {
  params: Promise<{ opponent: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { opponent } = await params;
  const decoded = decodeURIComponent(opponent);
  const game = getGameByOpponent(decoded);

  if (!game) notFound();

  return (
    <>
      <Header />
      <main className="pt-16">
        <GameDetailClient game={game} />
      </main>
      <Footer />
    </>
  );
}
