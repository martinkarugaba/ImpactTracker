"use client";

import { useQuery } from "@tanstack/react-query";
import {
  batchGetDistrictNames,
  batchGetSubCountyNames,
  batchGetCountryNames,
} from "../actions/location-lookup";

export interface LocationNames {
  districts: Record<string, string>;
  subCounties: Record<string, string>;
  countries: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
}

export function useLocationNames(
  districtIds: string[] = [],
  subCountyIds: string[] = [],
  countryIds: string[] = []
): LocationNames {
  // Filter out empty values
  const filteredDistrictIds = districtIds.filter(Boolean);
  const filteredSubCountyIds = subCountyIds.filter(Boolean);
  const filteredCountryIds = countryIds.filter(Boolean);

  // Query for districts
  const {
    data: districts = {},
    isLoading: isLoadingDistricts,
    error: districtError,
  } = useQuery({
    queryKey: ["districts", filteredDistrictIds],
    queryFn: () =>
      filteredDistrictIds.length
        ? batchGetDistrictNames(filteredDistrictIds)
        : Promise.resolve({}),
    enabled: filteredDistrictIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for subCounties
  const {
    data: subCounties = {},
    isLoading: isLoadingSubCounties,
    error: subCountyError,
  } = useQuery({
    queryKey: ["subCounties", filteredSubCountyIds],
    queryFn: () =>
      filteredSubCountyIds.length
        ? batchGetSubCountyNames(filteredSubCountyIds)
        : Promise.resolve({}),
    enabled: filteredSubCountyIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for countries
  const {
    data: countries = {},
    isLoading: isLoadingCountries,
    error: countryError,
  } = useQuery({
    queryKey: ["countries", filteredCountryIds],
    queryFn: () =>
      filteredCountryIds.length
        ? batchGetCountryNames(filteredCountryIds)
        : Promise.resolve({}),
    enabled: filteredCountryIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading =
    isLoadingDistricts || isLoadingSubCounties || isLoadingCountries;

  const error = districtError || subCountyError || countryError;

  return {
    districts,
    subCounties,
    countries,
    isLoading,
    error,
  };
}
