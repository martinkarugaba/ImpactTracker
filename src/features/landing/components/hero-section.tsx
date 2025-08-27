import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      <Container className="relative z-10">
        <div className="flex flex-col items-center space-y-16">
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-8 text-center"
          >
            <div className="border-primary/20 from-primary/10 via-primary/5 to-primary/10 text-primary inline-flex items-center rounded-full border bg-gradient-to-r px-6 py-2 text-sm font-medium backdrop-blur-sm">
              <span className="relative mr-3 flex h-2 w-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              Now with advanced analytics
            </div>
            <h1 className="max-w-5xl text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Track your impact with{" "}
              <span className="relative">
                <span className="from-primary via-primary/90 to-primary/70 bg-gradient-to-br bg-clip-text text-transparent">
                  Precision
                </span>
              </span>
            </h1>
            <p className="text-muted-foreground/80 max-w-4xl text-lg md:text-xl lg:text-2xl">
              Empower your non-profit with{" "}
              <span className="text-foreground font-semibold">ImpactTrack</span>
              , the all-in-one platform for participant tracking, training
              management, and VSLA monitoring. Gain insights, optimize programs,
              and demonstrate your impact.
            </p>
            <div className="flex flex-col gap-6 pt-8 sm:flex-row">
              <Button
                size="lg"
                className="group shadow-primary/25 hover:shadow-primary/30 h-14 px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
                asChild
              >
                <Link href="/signup">
                  <span className="flex items-center gap-3">
                    Get Started for Free
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group border-border/50 bg-background/50 hover:bg-background/80 h-14 px-8 text-base font-semibold backdrop-blur-sm"
                asChild
              >
                <Link href="#demo">
                  <span className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 transition-transform group-hover:scale-110"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Watch Demo
                  </span>
                </Link>
              </Button>
            </div>
            <div className="pt-8">
              <p className="text-muted-foreground/60 mb-4 text-sm font-medium">
                Trusted by NGOs and development organizations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                <div className="from-primary/60 to-primary/40 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                  Organization Alpha
                </div>
                <div className="from-primary/60 to-primary/40 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                  NGO Partner Beta
                </div>
                <div className="from-primary/60 to-primary/40 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                  Client Organization
                </div>
                <div className="from-primary/60 to-primary/40 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                  Development Partner
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-6xl"
          >
            <div className="border-border/50 from-card/80 via-card/60 to-card/40 relative h-[300px] overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-2xl backdrop-blur-xl md:h-[400px] lg:h-[500px]">
              <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent"></div>
              <div className="from-background/50 to-background/20 absolute inset-[1px] rounded-[calc(1.5rem-1px)] bg-gradient-to-br"></div>
              <div className="relative z-10 flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground/60 text-2xl font-semibold md:text-3xl">
                    Dashboard Preview
                  </div>
                  <div className="text-muted-foreground/40 mt-2 text-sm">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
      <div className="absolute inset-0 -z-10">
        <div className="from-primary/10 via-background to-secondary/10 absolute inset-0 bg-gradient-to-br"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--primary)/15,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--secondary)/10,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)/5,transparent_70%)]"></div>
      </div>
    </section>
  );
}
