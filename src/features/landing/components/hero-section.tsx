import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-6"
          >
            <div className="border-border/40 bg-background/50 text-muted-foreground inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <span className="relative mr-2 flex h-2 w-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              Now with advanced analytics
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Track Your Impact with{" "}
              <span className="relative">
                <span className="text-primary relative z-10">Precision</span>
                <span className="bg-primary/20 absolute bottom-0 left-0 -z-10 h-3 w-full"></span>
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
              Empower your non-profit with ImpactTrack, the all-in-one platform
              for participant tracking, training management, and VSLA
              monitoring. Gain insights, optimize programs, and demonstrate your
              impact.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button size="lg" className="group" asChild>
                <Link href="/signup">
                  <span className="flex items-center gap-2">
                    Get Started for Free
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group" asChild>
                <Link href="#demo">
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform group-hover:scale-110"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Watch Demo
                  </span>
                </Link>
              </Button>
            </div>
            <div className="pt-6">
              <p className="text-muted-foreground mb-2 text-sm">
                Trusted by NGOs and development organizations
              </p>
              <div className="flex flex-wrap items-center gap-6 opacity-70">
                <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
                  CARE International
                </div>
                <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
                  Oxfam
                </div>
                <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
                  World Vision
                </div>
                <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
                  Save the Children
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="from-primary/20 via-secondary/20 to-primary/10 relative h-[400px] rounded-2xl bg-gradient-to-br p-4 shadow-2xl lg:h-[500px]"
          >
            <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-2xl bg-gradient-to-br backdrop-blur-sm"></div>
            <div className="border-border/20 absolute inset-0 rounded-2xl border"></div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
              <div className="text-muted-foreground text-lg font-medium">
                Dashboard Preview
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_60%,var(--sidebar-primary)_0,transparent_100%)] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)_0,transparent_50%)] opacity-5"></div>
      </div>
    </section>
  );
}
