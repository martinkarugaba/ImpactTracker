import { Suspense } from "react";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { OverviewDashboard } from "@/features/overview/components/overview-dashboard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function KPIOverviewLoading() {
  return (
    <div className="space-y-6">
      {/* Main KPI Cards Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="mb-1 h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Cards Loading */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-64 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <PageTitle title="Overview" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <Suspense fallback={<KPIOverviewLoading />}>
              <OverviewDashboard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
