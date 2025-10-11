import { Suspense } from "react";
import { auth } from "@/features/auth/auth";
import { getUserClusterId } from "@/features/auth/actions";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Users,
  ArrowLeft,
  CheckCircle,
  FileCheck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { getSkillDetails } from "@/features/skills/actions";
import { SkillParticipantsTable } from "@/features/skills/components/data-table/skill-participants-table";
import type { SkillStatus } from "@/features/skills/types/types";
import { cn } from "@/lib/utils";

interface PageProps {
  params: {
    skillName: string;
  };
  searchParams: {
    status?: SkillStatus;
  };
}

interface SkillDetailsContentProps {
  skillName: string;
  clusterId?: string;
}

async function SkillDetailsContent({
  skillName,
  clusterId,
}: SkillDetailsContentProps) {
  const response = await getSkillDetails(skillName, undefined, clusterId);

  if (!response.success || !response.data) {
    notFound();
  }

  const skill = response.data;

  // Filter participants by status for tabs
  const allParticipants = skill.participants;
  const participationOnly = skill.participants.filter(
    p => p.skillStatus === "participation"
  );
  const completions = skill.participants.filter(
    p => p.skillStatus === "completion"
  );
  const certifications = skill.participants.filter(
    p => p.skillStatus === "certification"
  );

  const skillTypeColors = {
    vocational:
      "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300",
    soft: "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-300",
    business:
      "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/skills">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Skills
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              {skill.skillName}
            </h2>
            <Badge
              variant="outline"
              className={cn("text-sm", skillTypeColors[skill.skillType])}
            >
              <Award className="mr-1 h-3 w-3" />
              {skill.skillType}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Detailed view of participants who have acquired this skill
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-purple-600" />
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{skill.totalParticipants}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              With this skill
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Participations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {skill.participationsCount}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {Math.round(
                (skill.participationsCount / skill.totalParticipants) * 100
              )}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{skill.completionsCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {skill.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FileCheck className="h-4 w-4 text-amber-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {skill.certificationsCount}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {skill.certificationRate}% certification rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                All Participants
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-auto min-w-[1.5rem] rounded-full px-1.5 text-xs"
                >
                  {allParticipants.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="participation">
                Participations
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-auto min-w-[1.5rem] rounded-full px-1.5 text-xs"
                >
                  {participationOnly.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completion">
                Completions
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-auto min-w-[1.5rem] rounded-full px-1.5 text-xs"
                >
                  {completions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="certification">
                Certifications
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-auto min-w-[1.5rem] rounded-full px-1.5 text-xs"
                >
                  {certifications.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <SkillParticipantsTable participants={allParticipants} />
            </TabsContent>

            <TabsContent value="participation" className="space-y-4">
              <SkillParticipantsTable participants={participationOnly} />
            </TabsContent>

            <TabsContent value="completion" className="space-y-4">
              <SkillParticipantsTable participants={completions} />
            </TabsContent>

            <TabsContent value="certification" className="space-y-4">
              <SkillParticipantsTable participants={certifications} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SkillDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const clusterId = (await getUserClusterId()) ?? undefined;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="bg-muted h-20 animate-pulse rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="bg-muted h-32" />
                </Card>
              ))}
            </div>
            <Card className="animate-pulse">
              <CardContent className="bg-muted h-96" />
            </Card>
          </div>
        }
      >
        <SkillDetailsContent
          skillName={params.skillName}
          clusterId={clusterId}
        />
      </Suspense>
    </div>
  );
}
