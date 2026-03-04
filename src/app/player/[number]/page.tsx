import { notFound } from "next/navigation";
import { getPlayerByNumber, getAllPlayerNumbers } from "@/lib/data";
import PlayerDetailClient from "@/components/sections/PlayerDetailClient";

export function generateStaticParams() {
  return getAllPlayerNumbers().map((number) => ({
    number: String(number),
  }));
}

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { number } = await params;
  const playerNum = parseInt(number, 10);
  const data = getPlayerByNumber(playerNum);

  if (!data) notFound();

  return <PlayerDetailClient summary={data.summary} games={data.games} />;
}
