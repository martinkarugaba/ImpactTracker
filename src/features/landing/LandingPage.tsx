import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { TestimonialsSection } from "./components/testimonials-section";
import { PricingSection } from "./components/pricing-section";
import { FaqSection } from "./components/faq-section";
import { ContactSection } from "./components/contact-section";
import { CTASection } from "./components/cta-section";
import { Footer } from "./components/footer";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Global gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,var(--primary)/8,transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,var(--secondary)/6,transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,var(--primary)/4,transparent_80%)]"></div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <FeaturesSection />
          <TestimonialsSection />
          <PricingSection />
          <FaqSection />
          <ContactSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
