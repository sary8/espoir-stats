import { redirect, notFound } from "next/navigation";
import { getAllPlayerNumbers, getSeasonsWithData, getMemberIdByNumber } from "@/lib/data";

export async function generateStaticParams() {
  const seasons = await getSeasonsWithData();
  const allNums = await Promise.all(seasons.map((s) => getAllPlayerNumbers(s.id)));
  const params: { season: string; number: string }[] = [];
  for (let i = 0; i < seasons.length; i++) {
    for (const num of allNums[i]) {
      params.push({ season: seasons[i].id, number: String(num) });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ season: string; number: string }>;
}

export default async function SeasonPlayerPage({ params }: PageProps) {
  const { season, number } = await params;
  const num = parseInt(number, 10);
  if (isNaN(num)) notFound();
  const memberId = await getMemberIdByNumber(num, season);
  if (!memberId) notFound();
  redirect(`/season/${season}/member/${memberId}`);
}
