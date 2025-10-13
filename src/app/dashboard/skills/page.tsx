import { Suspense } from "react";
import { auth } from "@/features/auth/auth";
import { getUserClusterId } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Award,
  Users,
  TrendingUp,
  Briefcase,
  Brain,
  Building,
} from "lucide-react";
import { SkillsContainer } from "@/features/skills/components";
import { getSkillsMetrics } from "@/features/skills/actions";

export const metadata = {
  title: "Skills Dashboard | KPI Edge",
  description: "Track and analyze participant skills acquisition",
};

async function SkillsMetrics({ clusterId }: { clusterId?: string }) {
  const response = await getSkillsMetrics(clusterId);
  const metrics = response.data;

  if (!metrics) {
    return null;
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Skills"
        value={metrics.totalSkills}
        icon={<Award className="h-4 w-4" />}
        footer={{
          title: "Unique skills tracked",
          description: "Across all categories",
        }}
      />
      <MetricCard
        title="Participants with Skills"
        value={metrics.totalParticipantsWithSkills}
        icon={<Users className="h-4 w-4 text-purple-600" />}
        footer={{
          title: "Active participants",
          description: "With at least one skill",
        }}
      />
      <MetricCard
        title="Avg. Completion Rate"
        value={`${metrics.averageCompletionRate}%`}
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
        footer={{
          title: "Skills completion",
          description: "Average across all skills",
        }}
      />
      <MetricCard
        title="Avg. Certification Rate"
        value={`${metrics.averageCertificationRate}%`}
        icon={<Award className="h-4 w-4 text-amber-600" />}
        footer={{
          title: "Skills certification",
          description: "Average across all skills",
        }}
      />
    </div>
  );
}

async function SkillsBreakdown({ clusterId }: { clusterId?: string }) {
  const response = await getSkillsMetrics(clusterId);
  const metrics = response.data;

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="h-4 w-4 text-blue-600" />
            Vocational Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.vocationalSkillsCount}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Technical and trade skills
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Brain className="h-4 w-4 text-purple-600" />
            Soft Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.softSkillsCount}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            Communication and interpersonal
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Building className="h-4 w-4 text-green-600" />
            Business Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.businessSkillsCount}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Entrepreneurship and management
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function TopSkills({ clusterId }: { clusterId?: string }) {
  const response = await getSkillsMetrics(clusterId);
  const metrics = response.data;

  if (!metrics || metrics.topSkills.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.topSkills.map((skill, index) => (
            <div
              key={skill.skillName}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{skill.skillName}</div>
                  <div className="text-muted-foreground text-xs capitalize">
                    {skill.skillType}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {skill.participantCount}
                </div>
                <div className="text-muted-foreground text-xs">
                  participants
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SkillsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get cluster ID for role-based filtering
  const clusterId = (await getUserClusterId()) ?? undefined;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Skills Dashboard
          </h2>
          <p className="text-muted-foreground">
            Track and analyze participant skills acquisition across all programs
          </p>
        </div>
      </div>

      {/* Metrics */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="bg-muted h-32" />
              </Card>
            ))}
          </div>
        }
      >
        <SkillsMetrics clusterId={clusterId} />
      </Suspense>

      {/* Skills Breakdown */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="bg-muted h-24" />
              </Card>
            ))}
          </div>
        }
      >
        <SkillsBreakdown clusterId={clusterId} />
      </Suspense>

      {/* Top Skills */}
      <Suspense
        fallback={
          <Card className="animate-pulse">
            <CardContent className="bg-muted h-64" />
          </Card>
        }
      >
        <TopSkills clusterId={clusterId} />
      </Suspense>

      {/* All Skills */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">All Skills</h3>
          <p className="text-muted-foreground text-sm">
            Browse and filter all tracked skills
          </p>
        </div>
        <Suspense
          fallback={
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </CardContent>
            </Card>
          }
        >
          <SkillsContainer clusterId={clusterId} />
        </Suspense>
      </div>
    </div>
  );
}
