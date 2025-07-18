import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ActivityDetailsContainer } from "@/features/activities/components";
import { getActivity } from "@/features/activities/actions";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getProjects } from "@/features/projects/actions/projects";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ActivityDetailsPageProps {
  params: Promise<{ id: string }>; // Correctly type params as a Promise
}

// Loading component for the activity details page
function ActivityDetailsPageSkeleton() {
  return (
    <div className="space-y-6 px-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Activity Info Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>

      {/* Participants/Additional Info Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main activity details content
async function ActivityDetailsContent({ id }: { id: string }) {
  try {
    // Fetch activity and related data in parallel
    const [
      activityResult,
      organizationsResult,
      clustersResult,
      projectsResult,
    ] = await Promise.allSettled([
      getActivity(id).catch(error => {
        console.warn("Failed to fetch activity:", error);
        return {
          success: false,
          data: null,
          error: "Activity not found",
        };
      }),
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

    // Extract activity (required)
    const activity =
      activityResult.status === "fulfilled" && activityResult.value.success
        ? activityResult.value.data
        : null;

    if (!activity) {
      notFound();
    }

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
      <>
        <SiteHeader title={activity.title} />
        <div className="container px-6">
          <ActivityDetailsContainer
            activity={activity}
            organizations={organizations}
            clusters={clusters}
            projects={projects}
          />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading activity details:", error);
    notFound();
  }
}

// Main page component with proper metadata
export async function generateMetadata({ params }: ActivityDetailsPageProps) {
  try {
    // Unwrap params using await to get the id
    const { id } = await params;
    const result = await getActivity(id);
    if (result.success && result.data) {
      return {
        title: `${result.data.title} | Activities | KPI Edge`,
        description:
          result.data.description || `Details for ${result.data.title}`,
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Activity Details | KPI Edge",
    description: "View activity details and information",
  };
}

export default async function ActivityDetailsPage({
  params,
}: ActivityDetailsPageProps) {
  // Unwrap params using await to get the id
  const { id } = await params;

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:pt-0">
            <Suspense fallback={<ActivityDetailsPageSkeleton />}>
              <ActivityDetailsContent id={id} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
