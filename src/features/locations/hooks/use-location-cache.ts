import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  districtCodeCacheAtom,
  subCountyCodeCacheAtom,
  parishCodeCacheAtom,
  villageCodeCacheAtom,
  districtIdCacheAtom,
  subCountyIdCacheAtom,
  parishIdCacheAtom,
  villageIdCacheAtom,
  countryIdCacheAtom,
} from "../atoms/location-cache";
import {
  batchGetDistrictNamesByCodes,
  batchGetSubCountyNamesByCodes,
} from "@/features/organizations/actions/organization-location-lookup";
import {
  batchGetDistrictNames,
  batchGetSubCountyNames,
  batchGetParishNames,
  batchGetCountryNames,
  batchGetVillageNames,
} from "@/features/participants/actions/location-lookup";
import type { LocationData } from "../actions/location-data";

export function useLocationCache() {
  const { data: session } = useSession();
  const [districtCodeCache, setDistrictCodeCache] = useAtom(
    districtCodeCacheAtom
  );
  const [subCountyCodeCache, setSubCountyCodeCache] = useAtom(
    subCountyCodeCacheAtom
  );
  const [_parishCodeCache, setParishCodeCache] = useAtom(parishCodeCacheAtom);
  const [_villageCodeCache, setVillageCodeCache] =
    useAtom(villageCodeCacheAtom);
  const [districtIdCache, setDistrictIdCache] = useAtom(districtIdCacheAtom);
  const [subCountyIdCache, setSubCountyIdCache] = useAtom(subCountyIdCacheAtom);
  const [parishIdCache, setParishIdCache] = useAtom(parishIdCacheAtom);
  const [villageIdCache, setVillageIdCache] = useAtom(villageIdCacheAtom);
  const [countryIdCache, setCountryIdCache] = useAtom(countryIdCacheAtom);

  // Initialize caches from session data on mount
  useEffect(() => {
    if (session?.user?.locationData) {
      const locationData = session.user.locationData as LocationData;

      // Initialize code caches
      setDistrictCodeCache(locationData.districtCodes || {});
      setSubCountyCodeCache(locationData.subCountyCodes || {});
      setParishCodeCache(locationData.parishCodes || {});
      setVillageCodeCache(locationData.villageCodes || {});

      // Initialize ID caches from arrays
      const districtIds: Record<string, string> = {};
      locationData.districts?.forEach(d => {
        districtIds[d.id] = d.name;
      });
      setDistrictIdCache(districtIds);

      const subCountyIds: Record<string, string> = {};
      locationData.subCounties?.forEach(sc => {
        subCountyIds[sc.id] = sc.name;
      });
      setSubCountyIdCache(subCountyIds);

      const parishIds: Record<string, string> = {};
      locationData.parishes?.forEach(p => {
        parishIds[p.id] = p.name;
      });
      setParishIdCache(parishIds);

      const villageIds: Record<string, string> = {};
      locationData.villages?.forEach(v => {
        villageIds[v.id] = v.name;
      });
      setVillageIdCache(villageIds);

      const countryIds: Record<string, string> = {};
      locationData.countries?.forEach(c => {
        countryIds[c.id] = c.name;
      });
      setCountryIdCache(countryIds);
    }
  });

  // Cached batch lookup for district codes
  const getDistrictNamesByCodes = async (
    codes: string[]
  ): Promise<Record<string, string>> => {
    const uniqueCodes = [
      ...new Set(codes.filter(code => code && !code.includes(" "))),
    ];
    const uncachedCodes = uniqueCodes.filter(code => !districtCodeCache[code]);

    let newMappings: Record<string, string> = {};

    if (uncachedCodes.length > 0) {
      try {
        newMappings = await batchGetDistrictNamesByCodes(uncachedCodes);
        setDistrictCodeCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching district names by codes:", error);
        // Fallback to code as name for uncached items
        newMappings = uncachedCodes.reduce(
          (acc, code) => {
            acc[code] = code;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    codes.forEach(code => {
      if (code.includes(" ")) {
        // Already a name
        result[code] = code;
      } else {
        result[code] = districtCodeCache[code] || newMappings[code] || code;
      }
    });

    return result;
  };

  // Cached batch lookup for subcounty codes
  const getSubCountyNamesByCodes = async (
    codes: string[]
  ): Promise<Record<string, string>> => {
    const uniqueCodes = [
      ...new Set(codes.filter(code => code && !code.includes(" "))),
    ];
    const uncachedCodes = uniqueCodes.filter(code => !subCountyCodeCache[code]);

    let newMappings: Record<string, string> = {};

    if (uncachedCodes.length > 0) {
      try {
        newMappings = await batchGetSubCountyNamesByCodes(uncachedCodes);
        setSubCountyCodeCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching subcounty names by codes:", error);
        // Fallback to code as name for uncached items
        newMappings = uncachedCodes.reduce(
          (acc, code) => {
            acc[code] = code;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    codes.forEach(code => {
      if (code.includes(" ")) {
        // Already a name
        result[code] = code;
      } else {
        result[code] = subCountyCodeCache[code] || newMappings[code] || code;
      }
    });

    return result;
  };

  // Cached batch lookup for district IDs
  const getDistrictNamesByIds = async (
    ids: string[]
  ): Promise<Record<string, string>> => {
    const uniqueIds = [...new Set(ids.filter(id => id && id.includes("-")))];
    const uncachedIds = uniqueIds.filter(id => !districtIdCache[id]);

    let newMappings: Record<string, string> = {};

    if (uncachedIds.length > 0) {
      try {
        newMappings = await batchGetDistrictNames(uncachedIds);
        setDistrictIdCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching district names by IDs:", error);
        // Fallback to ID as name for uncached items
        newMappings = uncachedIds.reduce(
          (acc, id) => {
            acc[id] = id;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    ids.forEach(id => {
      if (!id.includes("-")) {
        // Already a name
        result[id] = id;
      } else {
        result[id] = districtIdCache[id] || newMappings[id] || id;
      }
    });

    return result;
  };

  // Cached batch lookup for subcounty IDs
  const getSubCountyNamesByIds = async (
    ids: string[]
  ): Promise<Record<string, string>> => {
    const uniqueIds = [...new Set(ids.filter(id => id && id.includes("-")))];
    const uncachedIds = uniqueIds.filter(id => !subCountyIdCache[id]);

    let newMappings: Record<string, string> = {};

    if (uncachedIds.length > 0) {
      try {
        newMappings = await batchGetSubCountyNames(uncachedIds);
        setSubCountyIdCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching subcounty names by IDs:", error);
        // Fallback to ID as name for uncached items
        newMappings = uncachedIds.reduce(
          (acc, id) => {
            acc[id] = id;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    ids.forEach(id => {
      if (!id.includes("-")) {
        // Already a name
        result[id] = id;
      } else {
        result[id] = subCountyIdCache[id] || newMappings[id] || id;
      }
    });

    return result;
  };

  // Cached batch lookup for parish IDs
  const getParishNamesByIds = async (
    ids: string[]
  ): Promise<Record<string, string>> => {
    const uniqueIds = [...new Set(ids.filter(id => id && id.includes("-")))];
    const uncachedIds = uniqueIds.filter(id => !parishIdCache[id]);

    let newMappings: Record<string, string> = {};

    if (uncachedIds.length > 0) {
      try {
        newMappings = await batchGetParishNames(uncachedIds);
        setParishIdCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching parish names by IDs:", error);
        // Fallback to ID as name for uncached items
        newMappings = uncachedIds.reduce(
          (acc, id) => {
            acc[id] = id;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    ids.forEach(id => {
      if (!id.includes("-")) {
        // Already a name
        result[id] = id;
      } else {
        result[id] = parishIdCache[id] || newMappings[id] || id;
      }
    });

    return result;
  };

  // Cached batch lookup for country IDs
  const getCountryNamesByIds = async (
    ids: string[]
  ): Promise<Record<string, string>> => {
    const uniqueIds = [...new Set(ids.filter(id => id && id.includes("-")))];
    const uncachedIds = uniqueIds.filter(id => !countryIdCache[id]);

    let newMappings: Record<string, string> = {};

    if (uncachedIds.length > 0) {
      try {
        newMappings = await batchGetCountryNames(uncachedIds);
        setCountryIdCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching country names by IDs:", error);
        // Fallback to ID as name for uncached items
        newMappings = uncachedIds.reduce(
          (acc, id) => {
            acc[id] = id;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    ids.forEach(id => {
      if (!id.includes("-")) {
        // Already a name
        result[id] = id;
      } else {
        result[id] = countryIdCache[id] || newMappings[id] || id;
      }
    });

    return result;
  };

  // Cached batch lookup for village IDs
  const getVillageNamesByIds = async (
    ids: string[]
  ): Promise<Record<string, string>> => {
    const uniqueIds = [...new Set(ids.filter(id => id && id.includes("-")))];
    const uncachedIds = uniqueIds.filter(id => !villageIdCache[id]);

    let newMappings: Record<string, string> = {};

    if (uncachedIds.length > 0) {
      try {
        newMappings = await batchGetVillageNames(uncachedIds);
        setVillageIdCache(prev => ({ ...prev, ...newMappings }));
      } catch (error) {
        console.error("Error fetching village names by IDs:", error);
        // Fallback to ID as name for uncached items
        newMappings = uncachedIds.reduce(
          (acc, id) => {
            acc[id] = id;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Build result from cache + new mappings
    const result: Record<string, string> = {};
    ids.forEach(id => {
      if (!id.includes("-")) {
        // Already a name
        result[id] = id;
      } else {
        result[id] = villageIdCache[id] || newMappings[id] || id;
      }
    });

    return result;
  };

  // Clear all caches (useful for logout or data refresh)
  const clearLocationCaches = () => {
    setDistrictCodeCache({});
    setSubCountyCodeCache({});
    setParishCodeCache({});
    setVillageCodeCache({});
    setDistrictIdCache({});
    setSubCountyIdCache({});
    setParishIdCache({});
    setVillageIdCache({});
    setCountryIdCache({});
  };

  return {
    getDistrictNamesByCodes,
    getSubCountyNamesByCodes,
    getDistrictNamesByIds,
    getSubCountyNamesByIds,
    getParishNamesByIds,
    getCountryNamesByIds,
    getVillageNamesByIds,
    clearLocationCaches,
  };
}
