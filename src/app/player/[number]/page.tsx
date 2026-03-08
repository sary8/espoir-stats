import { redirect } from "next/navigation";
import { getAllPlayerNumbers } from "@/lib/data";

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
  redirect(`/member/${number}`);
}
