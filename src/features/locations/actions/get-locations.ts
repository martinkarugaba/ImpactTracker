"use server";

import { db } from "@/lib/db";
import {
  countries,
  districts,
  parishes,
  villages,
  subCounties,
  clusters,
  clusterUsers,
} from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";
import type { LocationData } from "../components/columns";
import { auth } from "@/features/auth/auth";

export async function getLocations() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get districts that the user has access to based on their role
    let allowedDistrictCodes: string[] | undefined;

    if (session.user.role === "cluster_manager") {
      // Cluster manager sees only locations in districts of clusters they manage
      const userClusters = await db
        .select({ districts: clusters.districts })
        .from(clusterUsers)
        .innerJoin(clusters, eq(clusterUsers.cluster_id, clusters.id))
        .where(
          and(
            eq(clusterUsers.user_id, session.user.id),
            eq(clusterUsers.role, "cluster_manager")
          )
        );

      // Flatten the districts arrays from all clusters
      allowedDistrictCodes = Array.from(
        new Set(userClusters.flatMap(uc => uc.districts || []))
      );

      if (allowedDistrictCodes.length === 0) {
        return { success: true, data: [] };
      }
    }
    // super_admin sees all locations (no filter applied)

    // Get all locations with their parent names, filtered by allowed districts if applicable
    let results;

    if (allowedDistrictCodes && allowedDistrictCodes.length > 0) {
      // Filter for cluster managers
      results = await db.execute(sql`
        SELECT 
          'country' as type,
          c.id,
          c.name,
          c.code,
          NULL as parent_name,
          c.created_at,
          c.updated_at
        FROM ${countries} c
        WHERE EXISTS (
          SELECT 1 FROM ${districts} d WHERE d.country_id = c.id AND d.code = ANY(${allowedDistrictCodes})
        )
        
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
        WHERE d.code = ANY(${allowedDistrictCodes})
        
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
        WHERE d.code = ANY(${allowedDistrictCodes})
        
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
        JOIN ${districts} d ON d.id = sc.district_id
        WHERE d.code = ANY(${allowedDistrictCodes})
        
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
        JOIN ${subCounties} sc ON sc.id = p.sub_county_id
        JOIN ${districts} d ON d.id = sc.district_id
        WHERE d.code = ANY(${allowedDistrictCodes})
        
        ORDER BY type, name
      `);
    } else {
      // Super admin - get all locations
      results = await db.execute(sql`
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
    }

    // Convert the raw results to LocationData type
    const rows = results as unknown as Array<{
      id: string;
      name: string;
      code: string;
      type: string;
      parent_name: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;

    const locations: LocationData[] = rows.map(row => ({
      id: String(row.id),
      name: String(row.name),
      code: String(row.code),
      type: row.type as LocationData["type"],
      parentName: row.parent_name ?? undefined,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
    }));
    return { success: true, data: locations };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { success: false, error: "Failed to fetch locations" };
  }
}
