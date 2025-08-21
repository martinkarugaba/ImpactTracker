import { Brand } from "./components/brand";
import { MainNavigationMenu } from "./components/navigation-menu";
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
    <div className="font-public-sans relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between border-b border-b-[#e7eef3] px-4 py-3 md:px-10">
          <div className="flex items-center gap-4 text-[#0e151b]">
            <Brand />
            <h2 className="leading-tight font-bold tracking-[-0.015em] text-[#0e151b]">
              ImpactTrack
            </h2>
          </div>
          <MainNavigationMenu />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-2 py-5 md:px-40">
          <div className="layout-content-container w-full max-w-[960px] flex-1 flex-col">
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection />
            <FaqSection />
            <ContactSection />
            <CTASection />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
