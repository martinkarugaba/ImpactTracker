import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as motion from "motion/react-client";

const features = [
  {
    title: "Participant Tracking",
    description:
      "Easily manage participant data, track progress, and generate reports. Gain a holistic view of your beneficiaries and their engagement.",
    icon: (
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
        className="h-8 w-8"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m22 2-5 10-3-3-5 5" />
      </svg>
    ),
  },
  {
    title: "Training Management",
    description:
      "Plan, schedule, and monitor training programs with comprehensive tracking and assessment tools.",
    icon: (
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
        className="h-8 w-8"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: "Real-time Analytics",
    description: "Monitor impact metrics in real-time with automatic syncing.",
    icon: (
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
        className="h-8 w-8"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "VSLA Monitoring",
    description:
      "Monitor Village Savings and Loan Associations with transaction tracking and group performance metrics.",
    icon: (
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
        className="h-8 w-8"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Impact Reporting",
    description:
      "Generate comprehensive reports automatically to demonstrate program effectiveness to stakeholders.",
    icon: (
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
        className="h-8 w-8"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    title: "Multi-Organization Support",
    description:
      "Manage multiple organizations and projects from a unified dashboard.",
    icon: (
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
        className="h-8 w-8"
      >
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
        <path d="M12 3v6" />
      </svg>
    ),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative scroll-mt-16 py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background opacity-70"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--primary)/10,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--secondary)/8,transparent_50%)]"></div>

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="relative mr-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Powerful Features
          </div>
          <h2 className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl">
            Built for Impact
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground/80 md:text-xl">
            Everything you need to track participants, manage training programs,
            and monitor VSLAs with comprehensive analytics and reporting
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {/* Large Feature - Participant Tracking */}
          <motion.div variants={item} className="md:col-span-2">
            <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute inset-[1px] rounded-[calc(var(--radius)-1px)] bg-gradient-to-br from-background/50 to-background/20"></div>

              <CardHeader className="relative z-10 pb-6">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-500/30 group-hover:to-indigo-500/30">
                  {features[0].icon}
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  {features[0].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="mb-8 text-lg leading-relaxed text-muted-foreground/80">
                  {features[0].description}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                    Data Management
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                    Progress Tracking
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                    Reporting
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medium Feature - Training Management */}
          <motion.div variants={item}>
            <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute inset-[1px] rounded-[calc(var(--radius)-1px)] bg-gradient-to-br from-background/50 to-background/20"></div>

              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:from-green-500/30 group-hover:to-emerald-500/30">
                  {features[1].icon}
                </div>
                <CardTitle className="text-xl font-semibold">
                  {features[1].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  {features[1].description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tall Feature - VSLA Monitoring */}
          <motion.div variants={item} className="md:row-span-2">
            <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/8 via-transparent to-muted/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute inset-[1px] rounded-[calc(var(--radius)-1px)] bg-gradient-to-br from-background/50 to-background/20"></div>

              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-muted/30">
                  {features[3].icon}
                </div>
                <CardTitle className="text-xl font-semibold">
                  {features[3].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  {features[3].description}
                </CardDescription>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">
                      Group Performance
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">
                      Transaction Management
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">
                      Financial Inclusion
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medium Feature - Real-time Analytics */}
          <motion.div variants={item}>
            <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/8 via-transparent to-muted/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute inset-[1px] rounded-[calc(var(--radius)-1px)] bg-gradient-to-br from-background/50 to-background/20"></div>

              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-muted/30">
                  {features[2].icon}
                </div>
                <CardTitle className="text-xl font-semibold">
                  {features[2].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="mb-6 text-base leading-relaxed text-muted-foreground/80">
                  {features[2].description}
                </CardDescription>
                <div className="rounded-lg bg-muted/20 p-4">
                  <div className="text-3xl font-bold text-foreground">95%</div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Data Accuracy
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medium Feature - Impact Reporting */}
          <motion.div variants={item}>
            <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/8 via-transparent to-muted/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute inset-[1px] rounded-[calc(var(--radius)-1px)] bg-gradient-to-br from-background/50 to-background/20"></div>

              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-muted/30">
                  {features[4].icon}
                </div>
                <CardTitle className="text-xl font-semibold">
                  {features[4].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  {features[4].description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medium Feature - Multi-Organization Support */}
          <motion.div variants={item}>
            <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/8 via-transparent to-muted/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute inset-[1px] rounded-[calc(var(--radius)-1px)] bg-gradient-to-br from-background/50 to-background/20"></div>

              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-muted/30">
                  {features[5].icon}
                </div>
                <CardTitle className="text-lg font-semibold">
                  {features[5].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  {features[5].description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
