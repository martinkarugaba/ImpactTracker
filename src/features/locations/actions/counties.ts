"use server";

import { z } from "zod";
import { counties } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq, and, sql, ilike } from "drizzle-orm";
import type { PaginationParams } from "../types/pagination";

const createCountySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  country_id: z.string().min(1, "Country is required"),
  district_id: z.string().min(1, "District is required"),
});

export async function addCounty(data: z.infer<typeof createCountySchema>) {
  const validatedFields = createCountySchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  const { name, code, country_id, district_id } = validatedFields.data;

  try {
    await db.insert(counties).values({
      name,
      code,
      country_id,
      district_id,
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to create county" };
  }
}

export async function deleteCounty(id: string) {
  try {
    await db.delete(counties).where(eq(counties.id, id));
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to delete county" };
  }
}

export async function getCounties(
  params: {
    districtId?: string;
    pagination?: PaginationParams;
  } = {}
) {
  try {
    const { pagination = {}, districtId } = params;
    const { page = 1, limit = 10, search } = pagination;

    // Validate pagination parameters
    if (page < 1) throw new Error("Page must be greater than 0");
    if (limit < 1 || limit > 100)
      throw new Error("Limit must be between 1 and 100");

    // Build where conditions
    const whereConditions = [];

    if (districtId) {
      whereConditions.push(eq(counties.district_id, districtId));
    }

    if (search) {
      whereConditions.push(ilike(counties.name, `%${search}%`));
    }

    // Combine all conditions with AND
    const finalWhereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(counties)
      .where(finalWhereCondition);

    const total = Number(totalResult.count as number);
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const data = await db.query.counties.findMany({
      where: finalWhereCondition,
      with: {
        district: true,
      },
      orderBy: (counties, { asc }) => [asc(counties.name)],
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
    console.error("Error fetching counties:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to fetch counties",
    };
  }
}

export async function getCountyById(id: string) {
  try {
    const county = await db.query.counties.findFirst({
      where: eq(counties.id, id),
      with: {
        district: true,
      },
    });

    if (!county) {
      throw new Error("County not found");
    }

    return {
      success: true as const,
      data: county,
    };
  } catch (error) {
    console.error("Error fetching county:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch county",
    };
  }
}
