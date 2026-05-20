import { Navbar } from "@/components/shared/navbar";
import { HeroSection } from "@/components/shared/hero-section";
import { PillarsSection } from "@/components/shared/pillars-section";
import { PricingSection } from "@/components/shared/pricing-section";
import { TestimonialsSection } from "@/components/shared/testimonials-section";
import { FaqSection } from "@/components/shared/faq-section";
import { CtaSection } from "@/components/shared/cta-section";
import { Footer } from "@/components/shared/footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Naya",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Essai gratuit disponible",
  },
  description: "Logiciel de gestion pour naturopathes, sophrologues et hypnothérapeutes",
  url: "https://naya.app",
  inLanguage: "fr",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <PillarsSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
