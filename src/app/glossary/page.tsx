import { getSeasons } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlossaryContent from "@/components/sections/GlossaryContent";

export const revalidate = 3600;

export default async function GlossaryPage() {
  const seasons = await getSeasons();

  return (
    <>
      <Header seasons={seasons} />
      <main id="main-content" className="pt-16">
        <GlossaryContent />
      </main>
      <Footer />
    </>
  );
}
