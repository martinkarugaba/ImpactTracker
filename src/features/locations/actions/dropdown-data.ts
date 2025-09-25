"use server";

import { db } from "@/lib/db";
import {
  districts,
  counties,
  subCounties,
  municipalities,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getDistricts() {
  try {
    const data = await db.select().from(districts);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching districts:", error);
    return { success: false, error: "Failed to fetch districts", data: [] };
  }
}

export async function getCountiesByDistrict(districtId: string) {
  try {
    const data = await db
      .select()
      .from(counties)
      .where(eq(counties.district_id, districtId));
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching counties:", error);
    return { success: false, error: "Failed to fetch counties", data: [] };
  }
}

export async function getSubCountiesByCounty(countyId: string) {
  try {
    const data = await db
      .select()
      .from(subCounties)
      .where(eq(subCounties.county_id, countyId));
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching subcounties:", error);
    return { success: false, error: "Failed to fetch subcounties", data: [] };
  }
}

export async function getMunicipalitiesBySubCounty(subCountyId: string) {
  try {
    const data = await db
      .select()
      .from(municipalities)
      .where(eq(municipalities.sub_county_id, subCountyId));
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return {
      success: false,
      error: "Failed to fetch municipalities",
      data: [],
    };
  }
}
