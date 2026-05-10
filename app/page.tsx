import { Navbar } from "@/components/shared/navbar"
import { HeroSection } from "@/components/shared/hero-section"
import { FeaturesSection } from "@/components/shared/features-section"
import { PricingSection } from "@/components/shared/pricing-section"
import { FaqSection } from "@/components/shared/faq-section"
import { CtaSection } from "@/components/shared/cta-section"
import { Footer } from "@/components/shared/footer"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
