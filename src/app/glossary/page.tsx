import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlossaryContent from "@/components/sections/GlossaryContent";

export default function GlossaryPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="pt-16">
        <GlossaryContent />
      </main>
      <Footer />
    </>
  );
}
