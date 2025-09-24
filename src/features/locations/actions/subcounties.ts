"use server";

import { z } from "zod";
import { subCounties, districts, counties } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq, and, sql, ilike } from "drizzle-orm";
import type { PaginationParams } from "../types/pagination";

const createSubCountySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  districtId: z.string().min(1, "District is required"),
});

export async function addSubCounty(
  data: z.infer<typeof createSubCountySchema>
) {
  const validatedFields = createSubCountySchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  const { name, code, districtId } = validatedFields.data;

  try {
    // Get the district to retrieve country_id
    const district = await db.query.districts.findFirst({
      where: eq(districts.id, districtId),
    });

    if (!district) {
      return { error: "District not found" };
    }

    // Find the county for this district
    const county = await db.query.counties.findFirst({
      where: eq(counties.district_id, districtId),
    });

    if (!county) {
      return { error: "County not found for this district" };
    }

    await db.insert(subCounties).values({
      name,
      code,
      district_id: districtId,
      country_id: district.country_id,
      county_id: county.id,
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    console.error("Error adding sub county:", error);
    return { error: "Failed to create sub county" };
  }
}

export async function deleteSubCounty(id: string) {
  try {
    await db.delete(subCounties).where(eq(subCounties.id, id));
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to delete sub county" };
  }
}

export async function getSubCounties(
  params: {
    districtId?: string;
    countyId?: string;
    countryId?: string;
    pagination?: PaginationParams;
  } = {}
) {
  try {
    const { pagination = {}, districtId, countyId, countryId } = params;

    const { page = 1, limit = 10, search } = pagination;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    // Build where conditions
    const whereConditions = [];

    if (districtId) {
      whereConditions.push(eq(subCounties.district_id, districtId));
    }
    if (countyId) {
      whereConditions.push(eq(subCounties.county_id, countyId));
    }
    if (countryId) {
      whereConditions.push(eq(subCounties.country_id, countryId));
    }
    if (search) {
      whereConditions.push(ilike(subCounties.name, `%${search}%`));
    }

    // Combine all conditions with AND
    const finalWhereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(subCounties)
      .where(finalWhereCondition);

    const total = totalResult.count as number;

    // Get paginated data
    const data = await db.query.subCounties.findMany({
      where: finalWhereCondition,
      with: {
        district: true,
        county: true,
        country: true,
      },
      orderBy: (subCounties, { asc }) => [asc(subCounties.name)],
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
    console.error("Error fetching sub-counties:", error);
    return { success: false, error: "Failed to fetch sub-counties" };
  }
}
