import { redirect } from "next/navigation";
import { getAllPlayerNumbers, getSeasonsWithData } from "@/lib/data";

export async function generateStaticParams() {
  const seasons = await getSeasonsWithData();
  const params: { season: string; number: string }[] = [];
  for (const s of seasons) {
    for (const num of await getAllPlayerNumbers(s.id)) {
      params.push({ season: s.id, number: String(num) });
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
