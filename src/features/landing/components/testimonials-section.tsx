import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const testimonials = [
  {
    quote:
      "This KPI tracking tool has transformed how we monitor our business performance. The insights we've gained have directly contributed to a 25% increase in our core metrics.",
    author: "Sarah Johnson",
    role: "CEO, TechInnovate",
  },
  {
    quote:
      "The custom dashboards and real-time analytics have made it so easy to keep our entire team aligned on our most important metrics. I can't imagine running our business without it now.",
    author: "Michael Chen",
    role: "Operations Director, GrowthFast",
  },
  {
    quote:
      "The automated reporting feature alone has saved our team countless hours each month. Now we can focus on acting on insights rather than gathering data.",
    author: "Alex Rivera",
    role: "Marketing Lead, BrandPulse",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            What Our Customers Say
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Trusted by businesses worldwide to track and improve their
            performance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-border/40">
              <CardHeader className="pb-2">
                <div className="flex justify-start space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-yellow-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-lg italic">
                  &quot;{testimonial.quote}&quot;
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="text-lg font-semibold">
                  {testimonial.author}
                </div>
                <div className="text-base text-muted-foreground">
                  {testimonial.role}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="mb-4 text-3xl font-bold">
            <span className="text-primary">97%</span> of customers report
            improved decision-making
          </div>
          <Separator className="mx-auto my-8 w-1/2" />
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-base text-muted-foreground">
                Active businesses
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-base text-muted-foreground">
                KPIs tracked monthly
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">30%</div>
              <div className="text-base text-muted-foreground">
                Average performance increase
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
