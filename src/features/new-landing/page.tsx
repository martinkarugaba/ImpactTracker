import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { DetailedFeaturesSection } from "./components/DetailedFeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { FAQSection } from "./components/FAQSection";
import { ContactSection } from "./components/ContactSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function NewLandingPage() {
  return (
    <div className="group/design-root font-public-sans relative flex size-full min-h-screen flex-col overflow-x-hidden bg-slate-50">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="flex flex-1 justify-center px-4 py-5 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
          <div className="layout-content-container flex w-full max-w-6xl flex-1 flex-col">
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <DetailedFeaturesSection />
            <PricingSection />
            <FAQSection />
            <ContactSection />
            <CTASection />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
