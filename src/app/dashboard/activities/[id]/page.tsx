import { notFound, redirect } from "next/navigation";
import { getActivity } from "@/features/activities/actions";
import { auth } from "@/features/auth/auth";
import { ActivityDetailsContainer } from "@/features/activities/components/activity-details-container";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getProjects } from "@/features/projects/actions/projects";

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

  return (
    <div className="container mx-auto px-6 py-6">
      <ActivityDetailsContainer activity={activity} />
    </div>
  );
}
