import React from "react";
import InterventionsContainer from "@/features/interventions/components/container/interventions-container";
import { getInterventions } from "@/features/interventions/actions/get-interventions";
import { PageTitle } from "@/features/dashboard/components/page-title";

export default async function InterventionsPage() {
  const res = await getInterventions();
  const data = res.success ? (res.data ?? []) : [];

  try {
    return (
      <>
        <PageTitle title="Interventions" />
        <div className="flex flex-1 flex-col border-teal-500 px-2 sm:px-4 md:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2 border-green-500">
            <div className="flex flex-col gap-3 border-orange-500 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
              <InterventionsContainer initialData={data} />
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="container space-y-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border p-6">
            <p className="text-destructive">
              Error loading interventions data:{" "}
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
