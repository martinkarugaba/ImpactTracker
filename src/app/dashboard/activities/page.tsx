import { Suspense } from "react";
import { ActivitiesContainerNew } from "@/features/activities/components/container/activities-container-new";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { ActivitiesTableSkeleton } from "@/features/activities/components/table/activities-table-skeleton";
import { IconActivity } from "@tabler/icons-react";
import { auth } from "@/features/auth/auth";

// Force dynamic rendering since this page uses authentication
export const dynamic = "force-dynamic";

// Loading component for the page
function ActivitiesPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
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
    // Get user's session to access cluster information
    const session = await auth();

    if (!session?.user?.clusterId) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No cluster assigned</h3>
            <p className="mt-2 text-muted-foreground">
              Please contact an administrator to assign you to a cluster.
            </p>
          </div>
        </div>
      );
    }

    return <ActivitiesContainerNew clusterId={session.user.clusterId} />;
  } catch (error) {
    console.error("Error loading activities page data:", error);

    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading activities</h3>
          <p className="mt-2 text-muted-foreground">
            Failed to load page data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

// Main page component with proper metadata
export const metadata = {
  title: "Activities | Impact Tracker",
  description: "Manage and track organizational activities and events",
};

export default function ActivitiesPage() {
  return (
    <>
      <PageTitle title="Activities" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <Suspense fallback={<ActivitiesPageSkeleton />}>
              <ActivitiesPageContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
