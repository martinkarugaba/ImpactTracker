import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllParticipantsForMetrics } from "../../actions";
import { type Participant } from "../../types/types";

interface UseFilterOptionsProps {
  clusterId: string;
  locationNames: {
    districts: Record<string, string>;
    subCounties: Record<string, string>;
  };
}

export function useFilterOptions({
  clusterId,
  locationNames,
}: UseFilterOptionsProps) {
  // Get ALL participants (unfiltered) for generating filter options
  const { data: allParticipantsResponse } = useQuery({
    queryKey: ["all-participants-for-filters", clusterId],
    queryFn: () => getAllParticipantsForMetrics(clusterId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since this is for filter options
  });

  const allParticipants = useMemo(() => {
    if (!allParticipantsResponse?.success || !allParticipantsResponse?.data) {
      return [];
    }
    return allParticipantsResponse.data.data || [];
  }, [allParticipantsResponse]);

  return useMemo(() => {
    const uniqueDistricts = [
      ...new Set(
        allParticipants.map((p: Participant) => p.district).filter(Boolean)
      ),
    ].map(id => ({
      id: id as string,
      name: locationNames.districts[id as string] || (id as string),
    }));

    const uniqueSubCounties = [
      ...new Set(
        allParticipants.map((p: Participant) => p.subCounty).filter(Boolean)
      ),
    ].map(id => ({
      id: id as string,
      name: locationNames.subCounties[id as string] || (id as string),
    }));

    const uniqueParishes = [
      ...new Set(
        allParticipants.map((p: Participant) => p.parish).filter(Boolean)
      ),
    ].map(parish => ({
      id: parish as string,
      name: parish as string,
    }));

    const uniqueVillages = [
      ...new Set(
        allParticipants.map((p: Participant) => p.village).filter(Boolean)
      ),
    ].map(village => ({
      id: village as string,
      name: village as string,
    }));

    const uniqueCounties = [
      ...new Set(
        allParticipants.map((p: Participant) => p.countyName).filter(Boolean)
      ),
    ].map(county => ({
      id: county as string,
      name: county as string,
    }));

    const uniqueEnterprises = [
      ...new Set(
        allParticipants.map((p: Participant) => p.enterprise).filter(Boolean)
      ),
    ].map(enterprise => ({
      id: enterprise as string,
      name: enterprise as string,
    }));

    return {
      districts: uniqueDistricts,
      subCounties: uniqueSubCounties,
      parishes: uniqueParishes,
      villages: uniqueVillages,
      counties: uniqueCounties,
      enterprises: uniqueEnterprises,
    };
  }, [allParticipants, locationNames.districts, locationNames.subCounties]);
}
