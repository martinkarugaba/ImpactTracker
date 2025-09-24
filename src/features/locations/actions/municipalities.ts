"use server";

import { db } from "@/lib/db";
import { municipalities } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, sql, ilike } from "drizzle-orm";
import type { PaginationParams } from "../types/pagination";

export type CreateMunicipalityInput = {
  name: string;
  code: string;
  countryId: string;
  districtId: string;
  countyId: string;
  subCountyId: string;
};

export async function createMunicipality(data: CreateMunicipalityInput) {
  try {
    await db.insert(municipalities).values({
      name: data.name,
      code: data.code,
      country_id: data.countryId,
      district_id: data.districtId,
      county_id: data.countyId,
      sub_county_id: data.subCountyId,
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    console.error("Error creating municipality:", error);
    return { success: false, error: "Failed to create municipality" };
  }
}

export async function getMunicipality(id: string) {
  try {
    const data = await db.query.municipalities.findFirst({
      where: eq(municipalities.id, id),
      with: {
        country: true,
        district: true,
        county: true,
        subCounty: true,
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching municipality:", error);
    return { success: false, error: "Failed to fetch municipality" };
  }
}

export async function updateMunicipality(
  id: string,
  data: Partial<CreateMunicipalityInput>
) {
  try {
    await db
      .update(municipalities)
      .set({
        name: data.name,
        code: data.code,
        country_id: data.countryId,
        district_id: data.districtId,
        county_id: data.countyId,
        sub_county_id: data.subCountyId,
        updated_at: new Date(),
      })
      .where(eq(municipalities.id, id));

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    console.error("Error updating municipality:", error);
    return { success: false, error: "Failed to update municipality" };
  }
}

export async function deleteMunicipality(id: string) {
  try {
    await db.delete(municipalities).where(eq(municipalities.id, id));
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting municipality:", error);
    return { success: false, error: "Failed to delete municipality" };
  }
}

interface GetMunicipalitiesParams {
  countryId?: string;
  districtId?: string;
  countyId?: string;
  subCountyId?: string;
  pagination?: PaginationParams;
}

export async function getMunicipalities(params: GetMunicipalitiesParams = {}) {
  const {
    countryId,
    districtId,
    countyId,
    subCountyId,
    pagination = { page: 1, limit: 10 },
  } = params;

  try {
    const { page = 1, limit = 10, search } = pagination;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    // Build where conditions
    const whereConditions = [];

    if (districtId) {
      whereConditions.push(eq(municipalities.district_id, districtId));
    }

    if (countyId) {
      whereConditions.push(eq(municipalities.county_id, countyId));
    }

    if (subCountyId) {
      whereConditions.push(eq(municipalities.sub_county_id, subCountyId));
    }

    if (countryId) {
      whereConditions.push(eq(municipalities.country_id, countryId));
    }

    if (search) {
      whereConditions.push(ilike(municipalities.name, `%${search}%`));
    }

    // Combine all conditions with AND
    const finalWhereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(municipalities)
      .where(finalWhereCondition);

    const total = totalResult.count as number;

    // Get paginated data
    const data = await db.query.municipalities.findMany({
      where: finalWhereCondition,
      with: {
        country: true,
        district: true,
        county: true,
        subCounty: true,
      },
      orderBy: (municipalities, { asc }) => [asc(municipalities.name)],
      limit: validatedLimit,
      offset: offset,
    });

    const totalPages = Math.ceil(total / validatedLimit);

    return {
      success: true,
      data: {
        data,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext: validatedPage < totalPages,
          hasPrev: validatedPage > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return { success: false, error: "Failed to fetch municipalities" };
  }
}
