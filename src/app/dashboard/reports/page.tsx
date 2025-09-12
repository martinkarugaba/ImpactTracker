import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { ReportsContainer } from "@/features/reports/components";

// Loading component for the reports page
function ReportsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="from-primary/5 to-card bg-gradient-to-t p-6 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="mt-4">
              <Skeleton className="mb-1 h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4 p-6 pt-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main reports page content
async function ReportsPageContent() {
  return <ReportsContainer />;
}

// Main page component with proper metadata
export const metadata = {
  title: "Reports | KPI Edge",
  description: "View and manage activity reports and documentation",
};

export default function ReportsPage() {
  return (
    <>
      <PageTitle title="Reports" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <Suspense fallback={<ReportsPageSkeleton />}>
              <ReportsPageContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
