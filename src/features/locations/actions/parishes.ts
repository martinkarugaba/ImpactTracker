"use server";

import { z } from "zod";
import { parishes } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq, and, sql, ilike } from "drizzle-orm";
import type { PaginationParams } from "../types/pagination";

const createParishSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  subCountyId: z.string().min(1, "Sub County is required"),
  districtId: z.string().min(1, "District is required"),
  countyId: z.string().min(1, "County is required"),
  countryId: z.string().min(1, "Country is required"),
});

export async function addParish(data: z.infer<typeof createParishSchema>) {
  const validatedFields = createParishSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  const { name, code, subCountyId, districtId, countyId, countryId } =
    validatedFields.data;

  try {
    await db.insert(parishes).values({
      name,
      code,
      sub_county_id: subCountyId,
      district_id: districtId,
      county_id: countyId,
      country_id: countryId,
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to create parish" };
  }
}

export async function deleteParish(id: string) {
  try {
    await db.delete(parishes).where(eq(parishes.id, id));
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to delete parish" };
  }
}

export async function getParishes(
  params: {
    subCountyId?: string;
    districtId?: string;
    countyId?: string;
    countryId?: string;
    pagination?: PaginationParams;
  } = {}
) {
  try {
    const {
      pagination = {},
      subCountyId,
      districtId,
      countyId,
      countryId,
    } = params;

    const { page = 1, limit = 10, search } = pagination;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    // Build where conditions
    const whereConditions = [];

    if (subCountyId) {
      whereConditions.push(eq(parishes.sub_county_id, subCountyId));
    }
    if (districtId) {
      whereConditions.push(eq(parishes.district_id, districtId));
    }
    if (countyId) {
      whereConditions.push(eq(parishes.county_id, countyId));
    }
    if (countryId) {
      whereConditions.push(eq(parishes.country_id, countryId));
    }
    if (search) {
      whereConditions.push(ilike(parishes.name, `%${search}%`));
    }

    // Combine all conditions with AND
    const finalWhereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(parishes)
      .where(finalWhereCondition);

    const total = totalResult.count as number;

    // Get paginated data
    const data = await db.query.parishes.findMany({
      where: finalWhereCondition,
      with: {
        subCounty: true,
        district: true,
        county: true,
        country: true,
      },
      orderBy: (parishes, { asc }) => [asc(parishes.name)],
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
    console.error("Error fetching parishes:", error);
    return { success: false, error: "Failed to fetch parishes" };
  }
}
