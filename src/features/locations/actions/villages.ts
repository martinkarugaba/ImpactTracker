"use server";

import { z } from "zod";
import { villages } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq, and, sql, ilike } from "drizzle-orm";
import type { PaginationParams } from "../types/pagination";

const createVillageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  parishId: z.string().min(1, "Parish is required"),
  subCountyId: z.string().min(1, "Sub County is required"),
  countyId: z.string().min(1, "County is required"),
  districtId: z.string().min(1, "District is required"),
  countryId: z.string().min(1, "Country is required"),
});

export async function addVillage(data: z.infer<typeof createVillageSchema>) {
  const validatedFields = createVillageSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  const { name, code, parishId, subCountyId, countyId, districtId, countryId } =
    validatedFields.data;

  try {
    await db.insert(villages).values({
      name,
      code,
      parish_id: parishId,
      sub_county_id: subCountyId,
      county_id: countyId,
      district_id: districtId,
      country_id: countryId,
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to create village" };
  }
}

export async function deleteVillage(id: string) {
  try {
    await db.delete(villages).where(eq(villages.id, id));
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to delete village" };
  }
}

export async function getVillages(
  params: {
    parishId?: string;
    subCountyId?: string;
    countyId?: string;
    districtId?: string;
    countryId?: string;
    pagination?: PaginationParams;
  } = {}
) {
  try {
    const {
      pagination = {},
      parishId,
      subCountyId,
      countyId,
      districtId,
      countryId,
    } = params;
    const { page = 1, limit = 10, search } = pagination;

    // Validate pagination parameters
    if (page < 1) throw new Error("Page must be greater than 0");
    if (limit < 1 || limit > 100)
      throw new Error("Limit must be between 1 and 100");

    // Build where conditions
    const whereConditions = [];

    if (parishId) {
      whereConditions.push(eq(villages.parish_id, parishId));
    }
    if (subCountyId) {
      whereConditions.push(eq(villages.sub_county_id, subCountyId));
    }
    if (countyId) {
      whereConditions.push(eq(villages.county_id, countyId));
    }
    if (districtId) {
      whereConditions.push(eq(villages.district_id, districtId));
    }
    if (countryId) {
      whereConditions.push(eq(villages.country_id, countryId));
    }

    if (search) {
      whereConditions.push(ilike(villages.name, `%${search}%`));
    }

    // Combine all conditions with AND
    const finalWhereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(villages)
      .where(finalWhereCondition);

    const total = Number(totalResult.count as number);
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const data = await db.query.villages.findMany({
      where: finalWhereCondition,
      with: {
        parish: true,
        subCounty: true,
        county: true,
        district: true,
        country: true,
      },
      orderBy: (villages, { asc }) => [asc(villages.name)],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      success: true as const,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching villages:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to fetch villages",
    };
  }
}

export async function getVillageById(id: string) {
  try {
    const village = await db.query.villages.findFirst({
      where: eq(villages.id, id),
      with: {
        parish: true,
        subCounty: true,
        county: true,
        district: true,
        country: true,
      },
    });

    if (!village) {
      throw new Error("Village not found");
    }

    return {
      success: true as const,
      data: village,
    };
  } catch (error) {
    console.error("Error fetching village:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch village",
    };
  }
}
