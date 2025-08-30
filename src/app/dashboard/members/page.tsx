import { Suspense } from "react";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { MembersContainer } from "@/features/members/components";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for the members page
function MembersPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters Skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-16" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main page component with proper metadata
export const metadata = {
  title: "Members | KPI Edge",
  description: "Manage cluster members and organizations",
};

export default function MembersPage() {
  return (
    <>
      <SiteHeader title="Members" />
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={<MembersPageSkeleton />}>
          <MembersContainer />
        </Suspense>
      </div>
    </>
  );
}
