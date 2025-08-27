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
    <div className="bg-background relative flex min-h-screen flex-col overflow-x-hidden">
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
  );
}
