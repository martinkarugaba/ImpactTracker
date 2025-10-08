"use server";

import { db } from "@/lib/db";
import { countries, districts, subCounties, parishes } from "@/lib/db/schema";
import type { LocationType } from "../components/columns";

export async function getParentOptions(type: LocationType) {
  try {
    switch (type) {
      case "district":
        return {
          success: true,
          data: await db
            .select({ id: countries.id, name: countries.name })
            .from(countries),
        };
      case "subcounty":
        return {
          success: true,
          data: await db
            .select({ id: districts.id, name: districts.name })
            .from(districts),
        };
      case "parish":
        return {
          success: true,
          data: await db
            .select({ id: subCounties.id, name: subCounties.name })
            .from(subCounties),
        };
      case "village":
        return {
          success: true,
          data: await db
            .select({ id: parishes.id, name: parishes.name })
            .from(parishes),
        };
      default:
        return { success: true, data: [] };
    }
  } catch (error) {
    console.error("Error fetching parent options:", error);
    return { success: false, error: "Failed to fetch parent options" };
  }
}
