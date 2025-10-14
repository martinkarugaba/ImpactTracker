import React from "react";
import InterventionsContainer from "@/features/interventions/components/container/interventions-container";
import { getInterventions } from "@/features/interventions/actions/get-interventions";

export default async function InterventionsPage() {
  const res = await getInterventions();
  const data = res.success ? (res.data ?? []) : [];

  return (
    <div className="p-4 px-6">
      <InterventionsContainer initialData={data} />
    </div>
  );
}
