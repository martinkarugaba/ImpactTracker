import { Suspense } from "react";
import { ActivitiesContainer } from "@/features/activities/components/activities-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getProjects } from "@/features/projects/actions/projects";
import { SiteHeader } from "@/features/dashboard/components/site-header";

// Loading component for the page
function ActivitiesPageSkeleton() {
  return (
    <div className="space-y-6 px-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
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
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main activities page content
async function ActivitiesPageContent() {
  try {
    // Fetch all required data in parallel with better error handling
    const [organizationsResult, clustersResult, projectsResult] =
      await Promise.allSettled([
        getOrganizations().catch(error => {
          console.warn("Failed to fetch organizations:", error);
          return {
            success: false,
            data: [],
            error: "Organizations unavailable",
          };
        }),
        getClusters().catch(error => {
          console.warn("Failed to fetch clusters:", error);
          return {
            success: false,
            data: [],
            error: "Clusters unavailable",
          };
        }),
        getProjects().catch(error => {
          console.warn("Failed to fetch projects:", error);
          return {
            success: false,
            data: [],
            error: "Projects unavailable",
          };
        }),
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
      <div className="container px-6">
        <ActivitiesContainer
          organizations={organizations}
          clusters={clusters}
          projects={projects}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading activities page data:", error);

    return (
      <div className="flex h-96 items-center justify-center px-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading activities</h3>
          <p className="text-muted-foreground mt-2">
            Failed to load page data. This might be a temporary database
            connectivity issue.
          </p>
          <p className="text-muted-foreground mt-1">
            Please check your internet connection and try refreshing the page.
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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Suspense fallback={<ActivitiesPageSkeleton />}>
              <ActivitiesPageContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
