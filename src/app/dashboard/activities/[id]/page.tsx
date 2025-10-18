import { notFound, redirect } from "next/navigation";
import { getActivity } from "@/features/activities/actions";
import { auth } from "@/features/auth/auth";
import { ActivityDetailsContainer } from "@/features/activities/components/activity-details-container";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getProjects } from "@/features/projects/actions/projects";
import { PageTitle } from "@/features/dashboard/components/page-title";

interface ActivityDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailsPage({
  params,
}: ActivityDetailsPageProps) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Unwrap params using await to get the id
  const { id } = await params;

  // Fetch activity and related data in parallel
  const [activityResult, organizationsResult, clustersResult, projectsResult] =
    await Promise.allSettled([
      getActivity(id),
      getOrganizations().catch(() => ({ success: false, data: [] })),
      getClusters().catch(() => ({ success: false, data: [] })),
      getProjects().catch(() => ({ success: false, data: [] })),
    ]);

  if (
    activityResult.status !== "fulfilled" ||
    !activityResult.value.success ||
    !activityResult.value.data
  ) {
    notFound();
  }

  const activity = activityResult.value.data;

  // Extract organizations, clusters, and projects
  const _organizations =
    organizationsResult.status === "fulfilled" &&
    organizationsResult.value.success
      ? organizationsResult.value.data || []
      : [];

  const _clusters =
    clustersResult.status === "fulfilled" && clustersResult.value.success
      ? clustersResult.value.data || []
      : [];

  const _projects =
    projectsResult.status === "fulfilled" && projectsResult.value.success
      ? projectsResult.value.data || []
      : [];

  try {
    return (
      <>
        <PageTitle title={`Activity: ${activity.title || id}`} />
        <div className="flex flex-1 flex-col border-teal-500 px-2 sm:px-4 md:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2 border-green-500">
            <div className="flex flex-col gap-3 border-orange-500 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
              <ActivityDetailsContainer activity={activity} />
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="container space-y-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border p-6">
            <p className="text-destructive">
              Error loading activity details:{" "}
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
