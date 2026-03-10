import { redirect } from "next/navigation";
import { getAllPlayerNumbers, getSeasonsWithData } from "@/lib/data";

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
  redirect(`/season/${season}/member/${number}`);
}
