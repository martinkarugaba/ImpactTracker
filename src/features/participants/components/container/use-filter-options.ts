import { useMemo } from "react";
import { type Participant } from "../../types/types";

interface UseFilterOptionsProps {
  participants: Participant[];
  locationNames: {
    districts: Record<string, string>;
    subCounties: Record<string, string>;
  };
}

export function useFilterOptions({
  participants,
  locationNames,
}: UseFilterOptionsProps) {
  return useMemo(() => {
    const uniqueDistricts = [
      ...new Set(
        participants.map((p: Participant) => p.district).filter(Boolean)
      ),
    ].map(id => ({
      id: id as string,
      name: locationNames.districts[id as string] || (id as string),
    }));

    const uniqueSubCounties = [
      ...new Set(
        participants.map((p: Participant) => p.subCounty).filter(Boolean)
      ),
    ].map(id => ({
      id: id as string,
      name: locationNames.subCounties[id as string] || (id as string),
    }));

    const uniqueEnterprises = [
      ...new Set(
        participants.map((p: Participant) => p.enterprise).filter(Boolean)
      ),
    ].map(enterprise => ({
      id: enterprise as string,
      name: enterprise as string,
    }));

    return {
      districts: uniqueDistricts,
      subCounties: uniqueSubCounties,
      enterprises: uniqueEnterprises,
    };
  }, [participants, locationNames.districts, locationNames.subCounties]);
}
