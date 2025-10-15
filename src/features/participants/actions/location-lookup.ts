"use server";

import { db } from "@/lib/db";
import {
  districts,
  counties,
  subCounties,
  parishes,
  countries,
  villages,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface LocationLookupResult {
  id: string;
  name: string;
}

export async function getDistrictName(
  id: string
): Promise<LocationLookupResult | null> {
  try {
    if (!id) return null;

    // Check if it's already a name (not a UUID)
    if (!id.includes("-")) {
      return { id, name: id };
    }

    const district = await db.query.districts.findFirst({
      where: eq(districts.id, id),
      columns: {
        id: true,
        name: true,
      },
    });

    return district || null;
  } catch (error) {
    console.error("Error fetching district name:", error);
    return null;
  }
}

export async function getCountyName(
  id: string
): Promise<LocationLookupResult | null> {
  try {
    if (!id) return null;

    // Check if it's already a name (not a UUID)
    if (!id.includes("-")) {
      return { id, name: id };
    }

    const county = await db.query.counties.findFirst({
      where: eq(counties.id, id),
      columns: {
        id: true,
        name: true,
      },
    });

    return county || null;
  } catch (error) {
    console.error("Error fetching county name:", error);
    return null;
  }
}

export async function getSubCountyName(
  id: string
): Promise<LocationLookupResult | null> {
  try {
    if (!id) return null;

    // Check if it's already a name (not a UUID)
    if (!id.includes("-")) {
      return { id, name: id };
    }

    const subCounty = await db.query.subCounties.findFirst({
      where: eq(subCounties.id, id),
      columns: {
        id: true,
        name: true,
      },
    });

    return subCounty || null;
  } catch (error) {
    console.error("Error fetching subcounty name:", error);
    return null;
  }
}

export async function getCountryName(
  id: string
): Promise<LocationLookupResult | null> {
  try {
    if (!id) return null;

    // Check if it's already a name (not a UUID)
    if (!id.includes("-")) {
      return { id, name: id };
    }

    const country = await db.query.countries.findFirst({
      where: eq(countries.id, id),
      columns: {
        id: true,
        name: true,
      },
    });

    return country || null;
  } catch (error) {
    console.error("Error fetching country name:", error);
    return null;
  }
}

// Batch lookup functions for multiple IDs to reduce DB calls
export async function batchGetDistrictNames(
  ids: string[]
): Promise<Record<string, string>> {
  try {
    if (!ids.length) return {};

    // Filter out only UUID-like IDs
    const uuidIds = ids.filter(id => id && id.includes("-"));
    if (!uuidIds.length) {
      // Return a map of name:name for non-UUID strings
      return ids.reduce(
        (acc: Record<string, string>, id: string) => {
          if (id) acc[id] = id;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    const districtsData = await db.query.districts.findMany({
      where: sql`${districts.id} IN (${uuidIds.join(",")})`,
      columns: {
        id: true,
        name: true,
      },
    });

    return districtsData.reduce(
      (acc: Record<string, string>, district: { id: string; name: string }) => {
        acc[district.id] = district.name;
        return acc;
      },
      {} as Record<string, string>
    );
  } catch (error) {
    console.error("Error batch fetching district names:", error);
    return {};
  }
}

export async function batchGetSubCountyNames(
  ids: string[]
): Promise<Record<string, string>> {
  try {
    if (!ids.length) return {};

    // Filter out only UUID-like IDs
    const uuidIds = ids.filter(id => id && id.includes("-"));
    if (!uuidIds.length) {
      // Return a map of name:name for non-UUID strings
      return ids.reduce(
        (acc: Record<string, string>, id: string) => {
          if (id) acc[id] = id;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    const subcounties = await db.query.subCounties.findMany({
      where: sql`${subCounties.id} IN (${uuidIds.join(",")})`,
      columns: {
        id: true,
        name: true,
      },
    });

    return subcounties.reduce(
      (
        acc: Record<string, string>,
        subcounty: { id: string; name: string }
      ) => {
        acc[subcounty.id] = subcounty.name;
        return acc;
      },
      {} as Record<string, string>
    );
  } catch (error) {
    console.error("Error batch fetching subcounty names:", error);
    return {};
  }
}

export async function batchGetCountryNames(
  ids: string[]
): Promise<Record<string, string>> {
  try {
    if (!ids.length) return {};

    // Filter out only UUID-like IDs
    const uuidIds = ids.filter(id => id && id.includes("-"));
    if (!uuidIds.length) {
      // Return a map of name:name for non-UUID strings
      return ids.reduce(
        (acc: Record<string, string>, id: string) => {
          if (id) acc[id] = id;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    const countriesData = await db.query.countries.findMany({
      where: sql`${countries.id} IN (${uuidIds.join(",")})`,
      columns: {
        id: true,
        name: true,
      },
    });

    return countriesData.reduce(
      (acc: Record<string, string>, country: { id: string; name: string }) => {
        acc[country.id] = country.name;
        return acc;
      },
      {} as Record<string, string>
    );
  } catch (error) {
    console.error("Error batch fetching country names:", error);
    return {};
  }
}

export async function getParishes(
  subCountyId?: string
): Promise<LocationLookupResult[]> {
  try {
    if (!subCountyId) {
      // If no subcounty specified, return all parishes
      const allParishes = await db.query.parishes.findMany({
        columns: {
          id: true,
          name: true,
        },
        orderBy: [parishes.name],
      });

      return allParishes.map(parish => ({
        id: parish.id,
        name: parish.name,
      }));
    }

    // If subcounty is specified, filter parishes by subcounty
    const parishesInSubCounty = await db.query.parishes.findMany({
      where: eq(parishes.sub_county_id, subCountyId),
      columns: {
        id: true,
        name: true,
      },
      orderBy: [parishes.name],
    });

    return parishesInSubCounty.map(parish => ({
      id: parish.id,
      name: parish.name,
    }));
  } catch (error) {
    console.error("Error fetching parishes:", error);
    return [];
  }
}

export async function getParishName(
  id: string
): Promise<LocationLookupResult | null> {
  try {
    if (!id) return null;

    // Check if it's already a name (not a UUID)
    if (!id.includes("-")) {
      return { id, name: id };
    }

    const parish = await db.query.parishes.findFirst({
      where: eq(parishes.id, id),
      columns: {
        id: true,
        name: true,
      },
    });

    return parish || null;
  } catch (error) {
    console.error("Error fetching parish name:", error);
    return null;
  }
}

export async function batchGetParishNames(
  ids: string[]
): Promise<Record<string, string>> {
  try {
    if (!ids.length) return {};

    // Filter out only UUID-like IDs
    const uuidIds = ids.filter(id => id && id.includes("-"));
    if (!uuidIds.length) {
      // Return a map of name:name for non-UUID strings
      return ids.reduce(
        (acc: Record<string, string>, id: string) => {
          if (id) acc[id] = id;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    const parishesData = await db.query.parishes.findMany({
      where: sql`${parishes.id} IN (${uuidIds.join(",")})`,
      columns: {
        id: true,
        name: true,
      },
    });

    return parishesData.reduce(
      (acc: Record<string, string>, parish: { id: string; name: string }) => {
        acc[parish.id] = parish.name;
        return acc;
      },
      {} as Record<string, string>
    );
  } catch (error) {
    console.error("Error batch fetching parish names:", error);
    return {};
  }
}

export async function batchGetVillageNames(
  ids: string[]
): Promise<Record<string, string>> {
  try {
    if (!ids.length) return {};

    // Filter out only UUID-like IDs
    const uuidIds = ids.filter(id => id && id.includes("-"));
    if (!uuidIds.length) {
      // Return a map of name:name for non-UUID strings
      return ids.reduce(
        (acc: Record<string, string>, id: string) => {
          if (id) acc[id] = id;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    const villagesData = await db.query.villages.findMany({
      where: sql`${villages.id} IN (${uuidIds.join(",")})`,
      columns: {
        id: true,
        name: true,
      },
    });

    return villagesData.reduce(
      (acc: Record<string, string>, village: { id: string; name: string }) => {
        acc[village.id] = village.name;
        return acc;
      },
      {} as Record<string, string>
    );
  } catch (error) {
    console.error("Error batch fetching village names:", error);
    return {};
  }
}
