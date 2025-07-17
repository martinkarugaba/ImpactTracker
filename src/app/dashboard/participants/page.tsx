import { SiteHeader } from "@/features/dashboard/components/site-header";
import { ParticipantsClient } from "@/features/participants/components/participants-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects } from "@/features/projects/actions/projects";
import { getOrganizationId, getUserClusterId } from "@/features/auth/actions";
import { getClusters } from "@/features/clusters/actions/clusters";

function ParticipantsTableSkeleton() {
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

  // Search params will be passed directly to the ParticipantsClient component
  const organizationId = await getOrganizationId();
  const clusterId = await getUserClusterId();
  const projectsResult = await getProjects(organizationId ?? undefined);
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
      <SiteHeader title="Participants" />
      <div className="flex flex-1 flex-col px-6">
        <div className="@container/main flex flex-1 flex-col gap-2 p-4 @xl/main:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-0">
            <Suspense fallback={<ParticipantsTableSkeleton />}>
              <ParticipantsClient
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
                  district: searchParams["district"] as string,
                  sex: searchParams["sex"] as string,
                  isPWD: searchParams["isPWD"] as string,
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
