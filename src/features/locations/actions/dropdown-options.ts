"use server";

import { db } from "@/lib/db";
import {
  countries,
  districts,
  counties,
  subCounties,
  parishes,
  villages,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface DropdownOption {
  id: string;
  name: string;
  code?: string;
}

/**
 * Get all countries for the country dropdown
 */
export async function getCountryOptions(): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    const data = await db
      .select({
        id: countries.id,
        name: countries.name,
        code: countries.code,
      })
      .from(countries)
      .orderBy(countries.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching country options:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get districts for a specific country
 */
export async function getDistrictOptions(countryId: string): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!countryId) {
      return { success: true, data: [] };
    }

    const data = await db
      .select({
        id: districts.id,
        name: districts.name,
        code: districts.code,
      })
      .from(districts)
      .where(eq(districts.country_id, countryId))
      .orderBy(districts.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching district options:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get counties for a specific district
 */
export async function getCountyOptions(districtId: string): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!districtId) {
      return { success: true, data: [] };
    }

    const data = await db
      .select({
        id: counties.id,
        name: counties.name,
        code: counties.code,
      })
      .from(counties)
      .where(eq(counties.district_id, districtId))
      .orderBy(counties.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching county options:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get sub-counties for a specific county
 */
export async function getSubCountyOptions(countyId: string): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!countyId) {
      return { success: true, data: [] };
    }

    const data = await db
      .select({
        id: subCounties.id,
        name: subCounties.name,
        code: subCounties.code,
      })
      .from(subCounties)
      .where(eq(subCounties.county_id, countyId))
      .orderBy(subCounties.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching sub-county options:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get sub-counties for a specific district (alternative approach)
 */
export async function getSubCountyOptionsByDistrict(
  districtId: string
): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!districtId) {
      return { success: true, data: [] };
    }

    const data = await db
      .select({
        id: subCounties.id,
        name: subCounties.name,
        code: subCounties.code,
      })
      .from(subCounties)
      .where(eq(subCounties.district_id, districtId))
      .orderBy(subCounties.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching sub-county options by district:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get parishes for a specific sub-county
 */
export async function getParishOptions(subCountyId: string): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!subCountyId) {
      return { success: true, data: [] };
    }

    const data = await db
      .select({
        id: parishes.id,
        name: parishes.name,
        code: parishes.code,
      })
      .from(parishes)
      .where(eq(parishes.sub_county_id, subCountyId))
      .orderBy(parishes.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching parish options:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get villages for a specific parish
 */
export async function getVillageOptions(parishId: string): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!parishId) {
      return { success: true, data: [] };
    }

    const data = await db
      .select({
        id: villages.id,
        name: villages.name,
        code: villages.code,
      })
      .from(villages)
      .where(eq(villages.parish_id, parishId))
      .orderBy(villages.name);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching village options:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get region options for a specific country
 * This extracts unique regions from districts and includes comprehensive Uganda regions
 */
export async function getRegionOptions(countryId: string): Promise<{
  success: boolean;
  data: DropdownOption[];
}> {
  try {
    if (!countryId) {
      return { success: true, data: [] };
    }

    // First try to get regions from the districts table
    const data = await db
      .selectDistinct({
        region: districts.region,
      })
      .from(districts)
      .where(eq(districts.country_id, countryId));

    // Filter out null regions and create dropdown options
    const dbRegions: DropdownOption[] = data
      .filter(item => item.region && item.region.trim() !== "")
      .map(item => ({
        id: item.region!,
        name: item.region!,
      }));

    // Comprehensive list of Uganda regions as fallback
    const ugandaRegions: DropdownOption[] = [
      { id: "Central", name: "Central" },
      { id: "Eastern", name: "Eastern" },
      { id: "Northern", name: "Northern" },
      { id: "Western", name: "Western" },
      { id: "Buganda", name: "Buganda" },
      { id: "Bunyoro", name: "Bunyoro" },
      { id: "Busoga", name: "Busoga" },
      { id: "Ankole", name: "Ankole" },
      { id: "Kigezi", name: "Kigezi" },
      { id: "Toro", name: "Toro" },
      { id: "Lango", name: "Lango" },
      { id: "Acholi", name: "Acholi" },
      { id: "Karamoja", name: "Karamoja" },
      { id: "West Nile", name: "West Nile" },
      { id: "Rwenzori", name: "Rwenzori" },
      { id: "Sebei", name: "Sebei" },
    ];

    // Use database regions if available, otherwise use comprehensive Uganda list
    const regionOptions = dbRegions.length > 0 ? dbRegions : ugandaRegions;

    // Remove duplicates and sort
    const uniqueRegions = regionOptions
      .filter(
        (region, index, self) =>
          self.findIndex(r => r.id === region.id) === index
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return { success: true, data: uniqueRegions };
  } catch (error) {
    console.error("Error fetching region options:", error);
    return { success: false, data: [] };
  }
}
