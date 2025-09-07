import { Suspense } from "react";
import { VSLAsPageWrapper } from "@/features/vslas/components/vslas-page-wrapper";
import { VSLAsPageSkeleton } from "@/features/vslas/components/vslas-page-skeleton";
import { PageTitle } from "@/features/dashboard/components/page-title";

export default function VSLAsPage() {
  return (
    <>
      <PageTitle title="VSLAs" />
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={<VSLAsPageSkeleton />}>
          <VSLAsPageWrapper />
        </Suspense>
      </div>
    </>
  );
}
