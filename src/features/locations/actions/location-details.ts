"use server";

import { db } from "@/lib/db";
import type {
  districts,
  counties,
  subCounties,
  parishes,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

// Define response types for better type safety
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Get district details by ID
export async function getDistrictById(
  districtId: string
): Promise<ApiResponse<InferSelectModel<typeof districts>>> {
  try {
    const district = await db.query.districts.findFirst({
      where: (districts, { eq }) => eq(districts.id, districtId),
    });

    if (!district) {
      return { success: false, error: "District not found" };
    }

    return { success: true, data: district };
  } catch (error) {
    console.error("Error fetching district:", error);
    return { success: false, error: "Failed to fetch district" };
  }
}

// Get county details by ID
export async function getCountyById(
  countyId: string
): Promise<ApiResponse<InferSelectModel<typeof counties>>> {
  try {
    const county = await db.query.counties.findFirst({
      where: (counties, { eq }) => eq(counties.id, countyId),
    });

    if (!county) {
      return { success: false, error: "County not found" };
    }

    return { success: true, data: county };
  } catch (error) {
    console.error("Error fetching county:", error);
    return { success: false, error: "Failed to fetch county" };
  }
}

// Get subcounty details by ID
export async function getSubCountyById(
  subCountyId: string
): Promise<ApiResponse<InferSelectModel<typeof subCounties>>> {
  try {
    const subCounty = await db.query.subCounties.findFirst({
      where: (subCounties, { eq }) => eq(subCounties.id, subCountyId),
    });

    if (!subCounty) {
      return { success: false, error: "Sub-county not found" };
    }

    return { success: true, data: subCounty };
  } catch (error) {
    console.error("Error fetching sub-county:", error);
    return { success: false, error: "Failed to fetch sub-county" };
  }
}

// Get parish details by ID
export async function getParishById(
  parishId: string
): Promise<ApiResponse<InferSelectModel<typeof parishes>>> {
  try {
    const parish = await db.query.parishes.findFirst({
      where: (parishes, { eq }) => eq(parishes.id, parishId),
    });

    if (!parish) {
      return { success: false, error: "Parish not found" };
    }

    return { success: true, data: parish };
  } catch (error) {
    console.error("Error fetching parish:", error);
    return { success: false, error: "Failed to fetch parish" };
  }
}

// Find default county for a district
export async function findDefaultCountyForDistrict(
  districtId: string
): Promise<ApiResponse<InferSelectModel<typeof counties>>> {
  try {
    // First get the district to get the country_id
    const districtResult = await getDistrictById(districtId);
    if (!districtResult.success) {
      return {
        success: false,
        error: districtResult.error,
      };
    }

    if (!districtResult.data) {
      return {
        success: false,
        error: "District data not found",
      };
    }

    // Find the first county that matches the country_id
    const county = await db.query.counties.findFirst({
      where: (counties, { eq }) =>
        eq(counties.country_id, districtResult.data.country_id),
    });

    if (!county) {
      return { success: false, error: "No county found for this district" };
    }

    return { success: true, data: county };
  } catch (error) {
    console.error("Error finding default county:", error);
    return { success: false, error: "Failed to find default county" };
  }
}
