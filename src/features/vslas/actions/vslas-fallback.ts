"use server";

import { db } from "@/lib/db";
import { vslas, organizations, clusters, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fallback function to get VSLAs using only basic fields that should exist
 * This is used when the full schema migration hasn't been applied yet
 */
export async function getVSLAsFallback() {
  try {
    // Query with only the basic fields that existed in the original schema
    const vslaList = await db
      .select({
        id: vslas.id,
        name: vslas.name,
        code: vslas.code,
        description: vslas.description,
        organization_id: vslas.organization_id,
        cluster_id: vslas.cluster_id,
        project_id: vslas.project_id,
        country: vslas.country,
        district: vslas.district,
        sub_county: vslas.sub_county,
        parish: vslas.parish,
        village: vslas.village,
        address: vslas.address,
        total_members: vslas.total_members,
        total_savings: vslas.total_savings,
        total_loans: vslas.total_loans,
        meeting_frequency: vslas.meeting_frequency,
        meeting_day: vslas.meeting_day,
        meeting_time: vslas.meeting_time,
        status: vslas.status,
        created_at: vslas.created_at,
        updated_at: vslas.updated_at,
        organization: {
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
        },
        cluster: {
          id: clusters.id,
          name: clusters.name,
        },
        project: {
          id: projects.id,
          name: projects.name,
          acronym: projects.acronym,
        },
      })
      .from(vslas)
      .leftJoin(organizations, eq(vslas.organization_id, organizations.id))
      .leftJoin(clusters, eq(vslas.cluster_id, clusters.id))
      .leftJoin(projects, eq(vslas.project_id, projects.id));

    // Map to include default values for missing fields
    const mappedVSLAs = vslaList.map(vsla => ({
      ...vsla,
      // Add default values for new fields that might not exist yet
      primary_business: "Agriculture",
      primary_business_other: null,
      region: null,
      county: null,
      meeting_location: null,
      formation_date: new Date(), // Use a default date
      closing_date: null,
      lc1_chairperson_name: null,
      lc1_chairperson_contact: null,
      has_constitution: "no",
      has_signed_constitution: "no",
      bank_name: null,
      bank_branch: null,
      bank_account_number: null,
      registration_certificate_number: null,
      sacco_member: "no",
      notes: null,
    }));

    return { success: true, data: mappedVSLAs };
  } catch (error) {
    console.error("Error fetching VSLAs (fallback):", error);
    return { success: false, error: "Failed to fetch VSLAs" };
  }
}

/**
 * Check if the database schema has been updated with new VSLA fields
 */
export async function checkVSLASchemaStatus() {
  try {
    // Try to query one of the new fields to see if schema is updated
    await db
      .select({ formation_date: vslas.formation_date })
      .from(vslas)
      .limit(1);
    return { schemaUpdated: true };
  } catch (error) {
    console.log("Schema not updated yet:", error);
    return { schemaUpdated: false };
  }
}
