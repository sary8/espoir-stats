import { redirect, notFound } from "next/navigation";
import { getAllPlayerNumbers, getMemberIdByNumber } from "@/lib/data";

export async function generateStaticParams() {
  return (await getAllPlayerNumbers()).map((number) => ({
    number: String(number),
  }));
}

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { number } = await params;
  const num = parseInt(number, 10);
  if (isNaN(num)) notFound();
  const memberId = await getMemberIdByNumber(num);
  if (!memberId) notFound();
  redirect(`/member/${memberId}`);
}
