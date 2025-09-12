import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { getProjects } from "@/features/projects/actions/projects";
import { getUserClusterId } from "@/features/auth/actions";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { ParticipantsContainer } from "@/features/participants/components/container";

// Loading component for the page
function ParticipantsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs Navigation Skeleton */}
      <div className="w-full">
        <div className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1">
          <div className="grid w-full grid-cols-2">
            <div className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground bg-background text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - Metrics View */}
      <div className="space-y-6">
        {/* Metrics Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <Card
              key={i}
              className="from-primary/5 to-card bg-gradient-to-t shadow-xs"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-8 w-12" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Filter Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Organization Filters */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Location Filters */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Demographic Filters */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Search and Clear */}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main participants page content
async function ParticipantsPageContent() {
  try {
    // Get user's cluster ID first
    const clusterId = await getUserClusterId();

    if (!clusterId) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No cluster assigned</h3>
            <p className="text-muted-foreground mt-2">
              Please contact an administrator to assign you to a cluster.
            </p>
          </div>
        </div>
      );
    }

    // Fetch all required data in parallel
    const [organizationsResult, clustersResult, projectsResult] =
      await Promise.allSettled([
        getOrganizations(),
        getClusters().catch(() => ({ success: false, data: [] })), // Graceful fallback for optional data
        getProjects().catch(() => ({ success: false, data: [] })), // Graceful fallback for optional data
      ]);

    // Extract organizations (optional)
    const organizations =
      organizationsResult.status === "fulfilled" &&
      organizationsResult.value.success
        ? organizationsResult.value.data || []
        : [];

    // Extract clusters (optional)
    const clusters =
      clustersResult.status === "fulfilled" && clustersResult.value.success
        ? clustersResult.value.data || []
        : [];

    // Extract projects (optional)
    const projects =
      projectsResult.status === "fulfilled" && projectsResult.value.success
        ? projectsResult.value.data || []
        : [];

    return (
      <ParticipantsContainer
        clusterId={clusterId}
        projects={projects}
        clusters={clusters}
        organizations={organizations}
      />
    );
  } catch (error) {
    console.error("Error loading participants page data:", error);

    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading participants</h3>
          <p className="text-muted-foreground mt-2">
            Failed to load page data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

// Main page component with proper metadata
export const metadata = {
  title: "Participants | KPI Edge",
  description: "Manage and track project participants and beneficiaries",
};

export default function ParticipantsPage() {
  return (
    <>
      <PageTitle title="Participants" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <Suspense fallback={<ParticipantsPageSkeleton />}>
              <ParticipantsPageContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
