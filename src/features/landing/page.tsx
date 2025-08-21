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
        <header className="flex items-center justify-between border-b border-solid border-b-[#e7eef3] px-10 py-3 whitespace-nowrap">
          <div className="flex items-center gap-4 text-[#0e151b]">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="lg leading-tight font-bold tracking-[-0.015em] text-[#0e151b]">
              ImpactTrack
            </h2>
          </div>
          <MainNavigationMenu />
        </header>
        <main className="flex flex-1 justify-center px-40 py-5">
          <div className="layout-content-container max-w-[960px] flex-1 flex-col">
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            {/* Detailed Feature Breakdown, Pricing, FAQ, Contact, CTA sections */}
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
