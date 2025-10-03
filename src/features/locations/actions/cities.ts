"use server";

import { db } from "@/lib/db";
import { cities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  districts,
  counties,
  subCounties,
  municipalities,
} from "@/lib/db/schema";
import type { City } from "@/features/locations/components/data-table/cities-columns";

// API Result type for consistent response format
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCity(formData: FormData) {
  try {
    const rawFormData = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      countryId: formData.get("countryId") as string,
      districtId: formData.get("districtId") as string,
      countyId: formData.get("countyId") as string,
      subCountyId: formData.get("subCountyId") as string,
      municipalityId: formData.get("municipalityId") as string,
    };

    await db.insert(cities).values({
      name: rawFormData.name,
      code: rawFormData.code,
      country_id: rawFormData.countryId,
      district_id: rawFormData.districtId,
      county_id: rawFormData.countyId,
      sub_county_id: rawFormData.subCountyId,
      municipality_id: rawFormData.municipalityId,
    });

    revalidatePath("/dashboard/locations/cities");
    return { success: true };
  } catch (error) {
    console.error("Error creating city:", error);
    return { error: "Failed to create city" };
  }
}

export async function updateCity(id: string, formData: FormData) {
  try {
    const rawFormData = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      countryId: formData.get("countryId") as string,
      districtId: formData.get("districtId") as string,
      countyId: formData.get("countyId") as string,
      subCountyId: formData.get("subCountyId") as string,
      municipalityId: formData.get("municipalityId") as string,
    };

    await db
      .update(cities)
      .set({
        name: rawFormData.name,
        code: rawFormData.code,
        country_id: rawFormData.countryId,
        district_id: rawFormData.districtId,
        county_id: rawFormData.countyId,
        sub_county_id: rawFormData.subCountyId,
        municipality_id: rawFormData.municipalityId,
        updated_at: new Date(),
      })
      .where(eq(cities.id, id));

    revalidatePath("/dashboard/locations/cities");
    return { success: true };
  } catch (error) {
    console.error("Error updating city:", error);
    return { error: "Failed to update city" };
  }
}

export async function deleteCity(id: string) {
  try {
    await db.delete(cities).where(eq(cities.id, id));
    revalidatePath("/dashboard/locations/cities");
    return { success: true };
  } catch (error) {
    console.error("Error deleting city:", error);
    return { error: "Failed to delete city" };
  }
}

export async function getCities(
  countryId?: string
): Promise<ApiResult<City[]>> {
  try {
    const data = await db
      .select({
        id: cities.id,
        name: cities.name,
        code: cities.code,
        country_id: cities.country_id,
        district_id: cities.district_id,
        county_id: cities.county_id,
        sub_county_id: cities.sub_county_id,
        municipality_id: cities.municipality_id,
        created_at: cities.created_at,
        updated_at: cities.updated_at,
        district_name: districts.name,
        county_name: counties.name,
        subcounty_name: subCounties.name,
        municipality_name: municipalities.name,
      })
      .from(cities)
      .leftJoin(districts, eq(districts.id, cities.district_id))
      .leftJoin(counties, eq(counties.id, cities.county_id))
      .leftJoin(subCounties, eq(subCounties.id, cities.sub_county_id))
      .leftJoin(municipalities, eq(municipalities.id, cities.municipality_id))
      .where(countryId ? eq(cities.country_id, countryId) : undefined);

    // Convert null values to undefined to match City type
    const typedData: City[] = data.map(item => ({
      ...item,
      created_at: item.created_at ?? undefined,
      updated_at: item.updated_at ?? undefined,
      district_name: item.district_name ?? undefined,
      county_name: item.county_name ?? undefined,
      subcounty_name: item.subcounty_name ?? undefined,
      municipality_name: item.municipality_name ?? undefined,
    }));

    return {
      success: true,
      data: typedData,
    };
  } catch (error) {
    console.error("Error fetching cities:", error);
    return {
      success: false,
      error: "Failed to fetch cities",
    };
  }
}
