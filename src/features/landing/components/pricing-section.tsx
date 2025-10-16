import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out our KPI tracking features",
    features: [
      "Up to 3 KPIs",
      "Basic analytics",
      "Daily data updates",
      "Email support",
      "Single user",
    ],
    cta: "Start Free",
    ctaLink: "/signup?plan=free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "Best for growing businesses tracking multiple KPIs",
    features: [
      "Unlimited KPIs",
      "Advanced analytics",
      "Real-time updates",
      "Priority support",
      "Custom dashboards",
      "API access",
      "Data export",
      "Up to 10 team members",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description:
      "For organizations with advanced needs and multiple departments",
    features: [
      "Unlimited KPIs",
      "White-labeled dashboards",
      "Real-time data updates",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team members",
    ],
    cta: "Contact Sales",
    ctaLink: "mailto:enterprise@kpitracker.com",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the perfect plan for your organization's needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative flex h-full flex-col transition-shadow duration-200 hover:shadow-lg ${
                tier.featured
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {/* Featured badge */}
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="pb-6">
                <CardTitle className="text-center text-2xl font-semibold">
                  {tier.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-1 text-lg text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-3 text-center text-base">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={tier.featured ? "default" : "outline"}
                >
                  <Link href={tier.ctaLink}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-2 text-lg text-muted-foreground">
            Have questions about which plan is right for you?
          </p>
          <Button variant="outline" asChild>
            <Link href="mailto:sales@kpitracker.com">
              Contact our Sales Team
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
