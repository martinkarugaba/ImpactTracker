import { Suspense } from "react";
import { ActivitiesContainer } from "@/features/activities/components/activities-container";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { ActivitiesTableSkeleton } from "@/features/activities/components/table/activities-table-skeleton";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getProjects } from "@/features/projects/actions/projects";
import { IconActivity } from "@tabler/icons-react";

// Loading component for the page
function ActivitiesPageSkeleton() {
  return (
    <div className="space-y-6 px-6">
      {/* Metrics Cards Skeleton */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="..."
            footer={{
              title: "Loading...",
              description: "Fetching data...",
            }}
            icon={<IconActivity className="size-4" />}
          />
        ))}
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Table Skeleton */}
      <ActivitiesTableSkeleton rows={8} />
    </div>
  );
}

// Main activities page content
async function ActivitiesPageContent() {
  try {
    // Fetch all required data in parallel
    const [organizationsResult, clustersResult, projectsResult] =
      await Promise.allSettled([
        getOrganizations(),
        getClusters().catch(() => ({ success: false, data: [] })), // Graceful fallback for optional data
        getProjects().catch(() => ({ success: false, data: [] })), // Graceful fallback for optional data
      ]);

    // Extract organizations (required)
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
      <ActivitiesContainer
        organizations={organizations}
        clusters={clusters}
        projects={projects}
      />
    );
  } catch (error) {
    console.error("Error loading activities page data:", error);

    return (
      <div className="flex h-96 items-center justify-center px-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading activities</h3>
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
  title: "Activities | KPI Edge",
  description: "Manage and track organizational activities and events",
};

export default function ActivitiesPage() {
  return (
    <>
      <SiteHeader title="Activities" />
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={<ActivitiesPageSkeleton />}>
          <ActivitiesPageContent />
        </Suspense>
      </div>
    </>
  );
}
