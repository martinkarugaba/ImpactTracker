"use server";

import { z } from "zod";
import { countries } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq, sql, ilike, asc, inArray, and } from "drizzle-orm";
import type { PaginationParams } from "../types/pagination";

const createCountrySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .refine(
      code => {
        // Only allow East African countries and Ethiopia
        const eastAfricanCountryCodes = [
          "UG",
          "KE",
          "TZ",
          "RW",
          "BI",
          "SS",
          "ET",
        ];
        return eastAfricanCountryCodes.includes(code.toUpperCase());
      },
      {
        message:
          "Only East African countries and Ethiopia are allowed (UG, KE, TZ, RW, BI, SS, ET)",
      }
    ),
});

export async function addCountry(data: z.infer<typeof createCountrySchema>) {
  const validatedFields = createCountrySchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  const { name, code } = validatedFields.data;

  try {
    await db.insert(countries).values({
      name,
      code,
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to create country" };
  }
}

export async function deleteCountry(id: string) {
  try {
    await db.delete(countries).where(eq(countries.id, id));
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch {
    return { error: "Failed to delete country" };
  }
}

export async function getCountries(params: PaginationParams = {}) {
  try {
    const { page = 1, limit = 10, search } = params;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    // Define East African countries and Ethiopia by ISO codes
    const eastAfricanCountryCodes = ["UG", "KE", "TZ", "RW", "BI", "SS", "ET"];

    // Build search condition - only include East African countries
    const baseCondition = inArray(countries.code, eastAfricanCountryCodes);
    const searchCondition = search
      ? and(baseCondition, ilike(countries.name, `%${search}%`))
      : baseCondition;

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(countries)
      .where(searchCondition);

    const total = totalResult.count as number;

    // Get paginated data
    const data = await db
      .select()
      .from(countries)
      .where(searchCondition)
      .orderBy(asc(countries.name))
      .limit(validatedLimit)
      .offset(offset);

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
    console.error("Error fetching countries:", error);
    // Return a properly formatted response even in case of error
    return {
      success: false,
      error: "Failed to fetch countries",
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  }
}

export async function getCountryById(id: string) {
  try {
    const country = await db.query.countries.findFirst({
      where: eq(countries.id, id),
    });

    if (!country) {
      throw new Error("Country not found");
    }

    return {
      success: true as const,
      data: country,
    };
  } catch (error) {
    console.error("Error fetching country:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch country",
    };
  }
}

/**
 * Helper function to fetch all East African countries without pagination
 * Useful for populating dropdowns and selectors
 */
export async function getAllCountries() {
  try {
    // Define East African countries and Ethiopia by ISO codes
    const eastAfricanCountryCodes = ["UG", "KE", "TZ", "RW", "BI", "SS", "ET"];

    // Get East African countries ordered by name
    const data = await db
      .select()
      .from(countries)
      .where(inArray(countries.code, eastAfricanCountryCodes))
      .orderBy(asc(countries.name))
      .limit(50); // Set a reasonable limit for East African countries

    // Include pagination info in the response to match the expected format
    return {
      success: true,
      data: {
        data,
        pagination: {
          page: 1,
          limit: 50,
          total: data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching all countries:", error);
    return {
      success: false,
      error: "Failed to fetch countries",
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  }
}
