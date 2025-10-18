"use client";

import { DistrictsTable } from "../districts-table";
import { useDistricts } from "@/features/locations/hooks/use-locations-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DistrictsTabProps {
  countryId?: string;
}

export function DistrictsTab({ countryId }: DistrictsTabProps) {
  // Query for fetching districts
  const { data, isLoading, error } = useDistricts({ countryId });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading districts:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  // Extract the districts array from the response
  const districts = data?.success && data.data?.data ? data.data.data : [];

  return <DistrictsTable initialData={districts} countryId={countryId} />;
}
