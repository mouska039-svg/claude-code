import { Navbar } from "@/components/shared/navbar";
import { HeroSection } from "@/components/shared/hero-section";
import { PillarsSection } from "@/components/shared/pillars-section";
import { PricingSection } from "@/components/shared/pricing-section";
import { TestimonialsSection } from "@/components/shared/testimonials-section";
import { FaqSection } from "@/components/shared/faq-section";
import { CtaSection } from "@/components/shared/cta-section";
import { Footer } from "@/components/shared/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
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
