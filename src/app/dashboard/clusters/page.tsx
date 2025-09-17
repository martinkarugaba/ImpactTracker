import { PageTitle } from "@/features/dashboard/components/page-title";
import { getClusters } from "@/features/clusters/actions/clusters";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/auth";
import { ClustersTable } from "@/features/clusters/components/clusters-table";
import { Card, CardContent } from "@/components/ui/card";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const clustersResult = await getClusters();

    if (!clustersResult.success) {
      throw new Error(clustersResult.error || "Failed to fetch clusters");
    }

    return (
      <>
        <PageTitle title="Clusters" />
        <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
              <ClustersTable data={clustersResult.data ?? []} />
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageTitle title="Clusters" />
        <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-destructive">
                    Error loading clusters data:{" "}
                    {error instanceof Error
                      ? error.message
                      : "Unknown error occurred"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }
}
