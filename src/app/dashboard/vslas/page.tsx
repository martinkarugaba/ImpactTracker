import { Suspense } from "react";
import { VSLAsPageWrapper } from "@/features/vslas/components/pages/vslas-page-wrapper";
import { VSLAsPageSkeleton } from "@/features/vslas/components/pages/vslas-page-skeleton";
import { PageTitle } from "@/features/dashboard/components/page-title";

export default function VSLAsPage() {
  return (
    <>
      <PageTitle title="VSLAs" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <Suspense fallback={<VSLAsPageSkeleton />}>
              <VSLAsPageWrapper />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
