import { PageTitle } from "@/features/dashboard/components/page-title";
import { OrganizationsTable } from "@/features/organizations/components/organizations-table";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function OrganizationsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

export default async function Page() {
  const clustersResult = await getClusters();
  const organizationsResult = await getOrganizations();

  return (
    <>
      <PageTitle title="Organisations" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            {!clustersResult.success || !organizationsResult.success ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-destructive">
                    {!clustersResult.success && clustersResult.error && (
                      <span>
                        Error loading clusters: {clustersResult.error}
                      </span>
                    )}
                    {!organizationsResult.success &&
                      organizationsResult.error && (
                        <span>
                          Error loading organizations:{" "}
                          {organizationsResult.error}
                        </span>
                      )}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Suspense fallback={<OrganizationsTableSkeleton />}>
                <OrganizationsTable
                  organizations={organizationsResult.data || []}
                  clusters={clustersResult.data || []}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
