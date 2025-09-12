import { PageTitle } from "@/features/dashboard/components/page-title";
import { TrainingsClient } from "@/features/trainings/components/trainings-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects } from "@/features/projects/actions/projects";
import { getUserClusterId } from "@/features/auth/actions";
import { getClusters } from "@/features/clusters/actions/clusters";

function TrainingsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Need to await the searchParams promise to match Next.js 14+ types
  const searchParams = await props.searchParams;

  // Search params will be passed directly to the TrainingsClient component
  const clusterId = await getUserClusterId();
  const projectsResult = await getProjects();
  const clustersResult = await getClusters();

  if (!clusterId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">No cluster assigned to user</p>
      </div>
    );
  }

  if (!projectsResult.success || !clustersResult.success) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-destructive">
          {!projectsResult.success
            ? projectsResult.error
            : clustersResult.error}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Trainings" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <Suspense fallback={<TrainingsTableSkeleton />}>
              <TrainingsClient
                clusterId={clusterId}
                projects={projectsResult.data ?? []}
                clusters={clustersResult.data ?? []}
                searchParams={{
                  page: searchParams["page"] ? Number(searchParams["page"]) : 1,
                  per_page: searchParams["per_page"]
                    ? Number(searchParams["per_page"])
                    : 10,
                  search: searchParams["search"] as string,
                  project: searchParams["project"] as string,
                  status: searchParams["status"] as string,
                  organization: searchParams["organization"] as string,
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
