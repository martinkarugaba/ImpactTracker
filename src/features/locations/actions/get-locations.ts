"use server";

import { db } from "@/lib/db";
import {
  countries,
  districts,
  subCounties,
  parishes,
  villages,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { LocationData } from "../components/columns";

export async function getLocations() {
  try {
    // Get all locations with their parent names
    const results = await db.execute(sql`
      SELECT 
        'country' as type,
        c.id,
        c.name,
        c.code,
        NULL as parent_name,
        c.created_at,
        c.updated_at
      FROM ${countries} c
      
      UNION ALL
      
      SELECT 
        'district' as type,
        d.id,
        d.name,
        d.code,
        c.name as parent_name,
        d.created_at,
        d.updated_at
      FROM ${districts} d
      JOIN ${countries} c ON c.id = d.country_id
      
      UNION ALL
      
      SELECT 
        'subcounty' as type,
        sc.id,
        sc.name,
        sc.code,
        d.name as parent_name,
        sc.created_at,
        sc.updated_at
      FROM ${subCounties} sc
      JOIN ${districts} d ON d.id = sc.district_id
      
      UNION ALL
      
      SELECT 
        'parish' as type,
        p.id,
        p.name,
        p.code,
        sc.name as parent_name,
        p.created_at,
        p.updated_at
      FROM ${parishes} p
      JOIN ${subCounties} sc ON sc.id = p.sub_county_id
      
      UNION ALL
      
      SELECT 
        'village' as type,
        v.id,
        v.name,
        v.code,
        p.name as parent_name,
        v.created_at,
        v.updated_at
      FROM ${villages} v
      JOIN ${parishes} p ON p.id = v.parish_id
      
      ORDER BY type, name
    `);

    // Convert the raw results to LocationData type
    const locations: LocationData[] = results.map(
      (row: Record<string, unknown>) => ({
        id: String(row.id),
        name: String(row.name),
        code: String(row.code),
        type: String(row.type) as LocationData["type"],
        parentName: row.parent_name ? String(row.parent_name) : undefined,
        created_at: row.created_at
          ? new Date(String(row.created_at))
          : new Date(),
        updated_at: row.updated_at
          ? new Date(String(row.updated_at))
          : new Date(),
      })
    );
    return { success: true, data: locations };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { success: false, error: "Failed to fetch locations" };
  }
}
