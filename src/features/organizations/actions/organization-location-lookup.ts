"use server";

import { db } from "@/lib/db";
import { districts, subCounties } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { retryAsync } from "@/lib/db/retry";

export async function getDistrictNameByCode(code: string): Promise<string> {
  try {
    if (!code) return "";

    // Check if it's already a name (no spaces in codes typically)
    if (code.includes(" ")) {
      return code;
    }

    const district = await db.query.districts.findFirst({
      where: eq(districts.code, code),
      columns: {
        name: true,
      },
    });

    return district?.name || code;
  } catch (error) {
    console.error("Error fetching district name by code:", error);
    return code;
  }
}

export async function getSubCountyNameByCode(code: string): Promise<string> {
  try {
    if (!code) return "";

    // Check if it's already a name (no spaces in codes typically)
    if (code.includes(" ")) {
      return code;
    }

    const subCounty = await db.query.subCounties.findFirst({
      where: eq(subCounties.code, code),
      columns: {
        name: true,
      },
    });

    return subCounty?.name || code;
  } catch (error) {
    console.error("Error fetching subcounty name by code:", error);
    return code;
  }
}

export async function batchGetDistrictNamesByCodes(
  codes: string[]
): Promise<Record<string, string>> {
  try {
    if (!codes.length) return {};

    // Filter out codes that look like names already
    const actualCodes = codes.filter(code => code && !code.includes(" "));
    const nameMap: Record<string, string> = {};

    // Add names that are already names
    codes.forEach(code => {
      if (code && code.includes(" ")) {
        nameMap[code] = code;
      }
    });

    if (!actualCodes.length) return nameMap;

    // Remove duplicates before querying
    const uniqueCodes = [...new Set(actualCodes)];

    const districtsData = await db.query.districts.findMany({
      where: inArray(districts.code, uniqueCodes),
      columns: {
        code: true,
        name: true,
      },
    });

    // Add the retrieved names
    districtsData.forEach(district => {
      nameMap[district.code] = district.name;
    });

    // Add fallback for codes not found
    codes.forEach(code => {
      if (code && !nameMap[code]) {
        nameMap[code] = code;
      }
    });

    return nameMap;
  } catch (error) {
    console.error("Error batch fetching district names by codes:", error);
    // Return fallback map
    return codes.reduce((acc: Record<string, string>, code: string) => {
      if (code) acc[code] = code;
      return acc;
    }, {});
  }
}

export async function batchGetSubCountyNamesByCodes(
  codes: string[]
): Promise<Record<string, string>> {
  try {
    console.log("Fetching subcounty names for codes:", codes);

    const result = await retryAsync(() =>
      db.query.subCounties.findMany({
        where: inArray(subCounties.code, codes),
        columns: {
          code: true,
          name: true,
        },
      })
    );

    const subCountyMap: Record<string, string> = {};
    (result as Array<{ code: string; name: string }>).forEach(
      ({ code, name }) => {
        subCountyMap[code] = name;
      }
    );

    return subCountyMap;
  } catch (error) {
    console.error("Error fetching subcounty names:", error);
    throw error;
  }
}
