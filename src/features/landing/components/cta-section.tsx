import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20">
      <Container>
        <div className="relative z-10 rounded-3xl border border-primary/20 bg-primary/10 p-8 backdrop-blur-sm md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to transform how you track performance?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Join thousands of organizations using KPI Tracker to make better
              decisions with their data.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Schedule a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary)_0,transparent_100%)] opacity-10"></div>
    </section>
  );
}
