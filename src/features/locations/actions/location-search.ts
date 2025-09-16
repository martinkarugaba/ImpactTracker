"use server";

import { db } from "@/lib/db";
import {
  countries,
  districts,
  subCounties,
  parishes,
  villages,
} from "@/lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";

export interface LocationMatch {
  id: string;
  name: string;
  code: string;
  type: "country" | "district" | "subcounty" | "parish" | "village";
}

export interface LocationMappingResult {
  country?: LocationMatch;
  district?: LocationMatch;
  subCounty?: LocationMatch;
  parish?: LocationMatch;
  village?: LocationMatch;
  errors: string[];
}

/**
 * Search for a country by name with fuzzy matching
 */
export async function searchCountryByName(
  name: string
): Promise<LocationMatch | null> {
  if (!name?.trim()) return null;

  try {
    const result = await db
      .select({
        id: countries.id,
        name: countries.name,
        code: countries.code,
      })
      .from(countries)
      .where(ilike(countries.name, `%${name.trim()}%`))
      .limit(1);

    const country = result[0];
    if (!country) return null;

    return {
      id: country.id,
      name: country.name,
      code: country.code,
      type: "country",
    };
  } catch (error) {
    console.error("Error searching country:", error);
    return null;
  }
}

/**
 * Search for a district by name, optionally within a specific country
 */
export async function searchDistrictByName(
  name: string,
  countryName?: string
): Promise<LocationMatch | null> {
  if (!name?.trim()) return null;

  try {
    if (countryName?.trim()) {
      // Search with country filter
      const result = await db
        .select({
          id: districts.id,
          name: districts.name,
          code: districts.code,
        })
        .from(districts)
        .innerJoin(countries, eq(districts.country_id, countries.id))
        .where(
          and(
            ilike(districts.name, `%${name.trim()}%`),
            ilike(countries.name, `%${countryName.trim()}%`)
          )
        )
        .limit(1);

      const district = result[0];
      return district
        ? {
            id: district.id,
            name: district.name,
            code: district.code,
            type: "district",
          }
        : null;
    } else {
      // Search without country filter
      const result = await db
        .select({
          id: districts.id,
          name: districts.name,
          code: districts.code,
        })
        .from(districts)
        .where(ilike(districts.name, `%${name.trim()}%`))
        .limit(1);

      const district = result[0];
      return district
        ? {
            id: district.id,
            name: district.name,
            code: district.code,
            type: "district",
          }
        : null;
    }
  } catch (error) {
    console.error("Error searching district:", error);
    return null;
  }
}

/**
 * Search for a subcounty by name, optionally within a specific district
 */
export async function searchSubCountyByName(
  name: string,
  districtName?: string
): Promise<LocationMatch | null> {
  if (!name?.trim()) return null;

  try {
    if (districtName?.trim()) {
      // Search with district filter
      const result = await db
        .select({
          id: subCounties.id,
          name: subCounties.name,
          code: subCounties.code,
        })
        .from(subCounties)
        .innerJoin(districts, eq(subCounties.district_id, districts.id))
        .where(
          and(
            ilike(subCounties.name, `%${name.trim()}%`),
            ilike(districts.name, `%${districtName.trim()}%`)
          )
        )
        .limit(1);

      const subCounty = result[0];
      return subCounty
        ? {
            id: subCounty.id,
            name: subCounty.name,
            code: subCounty.code,
            type: "subcounty",
          }
        : null;
    } else {
      // Search without district filter
      const result = await db
        .select({
          id: subCounties.id,
          name: subCounties.name,
          code: subCounties.code,
        })
        .from(subCounties)
        .where(ilike(subCounties.name, `%${name.trim()}%`))
        .limit(1);

      const subCounty = result[0];
      return subCounty
        ? {
            id: subCounty.id,
            name: subCounty.name,
            code: subCounty.code,
            type: "subcounty",
          }
        : null;
    }
  } catch (error) {
    console.error("Error searching subcounty:", error);
    return null;
  }
}

/**
 * Search for a parish by name, optionally within a specific subcounty
 */
export async function searchParishByName(
  name: string,
  subCountyName?: string
): Promise<LocationMatch | null> {
  if (!name?.trim()) return null;

  try {
    if (subCountyName?.trim()) {
      // Search with subcounty filter
      const result = await db
        .select({
          id: parishes.id,
          name: parishes.name,
          code: parishes.code,
        })
        .from(parishes)
        .innerJoin(subCounties, eq(parishes.sub_county_id, subCounties.id))
        .where(
          and(
            ilike(parishes.name, `%${name.trim()}%`),
            ilike(subCounties.name, `%${subCountyName.trim()}%`)
          )
        )
        .limit(1);

      const parish = result[0];
      return parish
        ? {
            id: parish.id,
            name: parish.name,
            code: parish.code,
            type: "parish",
          }
        : null;
    } else {
      // Search without subcounty filter
      const result = await db
        .select({
          id: parishes.id,
          name: parishes.name,
          code: parishes.code,
        })
        .from(parishes)
        .where(ilike(parishes.name, `%${name.trim()}%`))
        .limit(1);

      const parish = result[0];
      return parish
        ? {
            id: parish.id,
            name: parish.name,
            code: parish.code,
            type: "parish",
          }
        : null;
    }
  } catch (error) {
    console.error("Error searching parish:", error);
    return null;
  }
}

/**
 * Search for a village by name, optionally within a specific parish
 */
export async function searchVillageByName(
  name: string,
  parishName?: string
): Promise<LocationMatch | null> {
  if (!name?.trim()) return null;

  try {
    if (parishName?.trim()) {
      // Search with parish filter
      const result = await db
        .select({
          id: villages.id,
          name: villages.name,
          code: villages.code,
        })
        .from(villages)
        .innerJoin(parishes, eq(villages.parish_id, parishes.id))
        .where(
          and(
            ilike(villages.name, `%${name.trim()}%`),
            ilike(parishes.name, `%${parishName.trim()}%`)
          )
        )
        .limit(1);

      const village = result[0];
      return village
        ? {
            id: village.id,
            name: village.name,
            code: village.code,
            type: "village",
          }
        : null;
    } else {
      // Search without parish filter
      const result = await db
        .select({
          id: villages.id,
          name: villages.name,
          code: villages.code,
        })
        .from(villages)
        .where(ilike(villages.name, `%${name.trim()}%`))
        .limit(1);

      const village = result[0];
      return village
        ? {
            id: village.id,
            name: village.name,
            code: village.code,
            type: "village",
          }
        : null;
    }
  } catch (error) {
    console.error("Error searching village:", error);
    return null;
  }
}

/**
 * Map location names to IDs for participant import
 * This is the main function to use during participant import
 */
export async function mapLocationNames(locationData: {
  country?: string;
  district?: string;
  subCounty?: string;
  parish?: string;
  village?: string;
}): Promise<LocationMappingResult> {
  const result: LocationMappingResult = {
    errors: [],
  };

  try {
    // Search for country first
    if (locationData.country) {
      const country = await searchCountryByName(locationData.country);
      if (country) {
        result.country = country;
      } else {
        result.errors.push(`Country not found: ${locationData.country}`);
      }
    }

    // Search for district
    if (locationData.district) {
      const district = await searchDistrictByName(
        locationData.district,
        locationData.country
      );
      if (district) {
        result.district = district;
      } else {
        result.errors.push(`District not found: ${locationData.district}`);
      }
    }

    // Search for subcounty
    if (locationData.subCounty) {
      const subCounty = await searchSubCountyByName(
        locationData.subCounty,
        locationData.district
      );
      if (subCounty) {
        result.subCounty = subCounty;
      } else {
        result.errors.push(`SubCounty not found: ${locationData.subCounty}`);
      }
    }

    // Search for parish
    if (locationData.parish) {
      const parish = await searchParishByName(
        locationData.parish,
        locationData.subCounty
      );
      if (parish) {
        result.parish = parish;
      } else {
        result.errors.push(`Parish not found: ${locationData.parish}`);
      }
    }

    // Search for village
    if (locationData.village) {
      const village = await searchVillageByName(
        locationData.village,
        locationData.parish
      );
      if (village) {
        result.village = village;
      } else {
        result.errors.push(`Village not found: ${locationData.village}`);
      }
    }

    return result;
  } catch (error) {
    console.error("Error mapping location names:", error);
    result.errors.push("Failed to map location names");
    return result;
  }
}
