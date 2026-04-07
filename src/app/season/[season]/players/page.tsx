import { redirect } from "next/navigation";
import { getSeasonsWithData } from "@/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getSeasonsWithData()).map((s) => ({ season: s.id }));
}

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function SeasonPlayersPage({ params }: PageProps) {
  const { season } = await params;
  redirect(`/season/${season}/members`);
}
