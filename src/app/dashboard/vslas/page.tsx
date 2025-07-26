import { Suspense } from "react";
import { VSLAsPageWrapper } from "@/features/vslas/components/vslas-page-wrapper";
import { VSLAsPageSkeleton } from "@/features/vslas/components/vslas-page-skeleton";

export default function VSLAsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Village Savings and Loans Associations
        </h2>
      </div>
      <Suspense fallback={<VSLAsPageSkeleton />}>
        <VSLAsPageWrapper />
      </Suspense>
    </div>
  );
}
