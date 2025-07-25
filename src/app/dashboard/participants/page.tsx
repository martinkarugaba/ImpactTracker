import { Suspense } from "react";
import { ParticipantsContainer } from "@/features/participants/components/participants-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { TableSkeleton } from "@/features/participants/components/table/table-skeleton";
import { getProjects } from "@/features/projects/actions/projects";
import { getUserClusterId } from "@/features/auth/actions";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getOrganizations } from "@/features/organizations/actions/organizations";

// Loading component for the page
function ParticipantsPageSkeleton() {
  return (
    <div className="space-y-6 px-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

      {/* Detailed Metrics Skeleton */}
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={8} />
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
        <div className="flex h-96 items-center justify-center px-6">
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
      <div className="flex h-96 items-center justify-center px-6">
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
      <SiteHeader title="Participants" />
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={<ParticipantsPageSkeleton />}>
          <ParticipantsPageContent />
        </Suspense>
      </div>
    </>
  );
}
