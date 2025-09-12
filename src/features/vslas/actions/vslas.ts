"use server";

import { db } from "@/lib/db";
import { vslas, organizations, clusters, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CreateVSLAInput, UpdateVSLAInput } from "../schemas/vsla-schema";
import { getVSLAsFallback, checkVSLASchemaStatus } from "./vslas-fallback";

export async function createVSLA(data: CreateVSLAInput) {
  try {
    // Convert optional fields to empty strings for database compatibility
    const vslaData = {
      ...data,
      parish: data.parish || "",
      village: data.village || "",
    };

    const newVSLA = await db.insert(vslas).values(vslaData).returning();
    return { success: true, data: newVSLA[0] };
  } catch (error) {
    console.error("Error creating VSLA:", error);
    return { success: false, error: "Failed to create VSLA" };
  }
}

export async function updateVSLA(id: string, data: UpdateVSLAInput) {
  try {
    // Convert optional fields to empty strings for database compatibility
    const vslaData = {
      ...data,
      ...(data.parish !== undefined && { parish: data.parish || "" }),
      ...(data.village !== undefined && { village: data.village || "" }),
    };

    const updatedVSLA = await db
      .update(vslas)
      .set(vslaData)
      .where(eq(vslas.id, id))
      .returning();

    if (!updatedVSLA.length) {
      return { success: false, error: "VSLA not found" };
    }

    return { success: true, data: updatedVSLA[0] };
  } catch (error) {
    console.error("Error updating VSLA:", error);
    return { success: false, error: "Failed to update VSLA" };
  }
}

export async function deleteVSLA(id: string) {
  try {
    const deletedVSLA = await db
      .delete(vslas)
      .where(eq(vslas.id, id))
      .returning();

    if (!deletedVSLA.length) {
      return { success: false, error: "VSLA not found" };
    }

    return { success: true, data: deletedVSLA[0] };
  } catch (error) {
    console.error("Error deleting VSLA:", error);
    return { success: false, error: "Failed to delete VSLA" };
  }
}

export async function getVSLAs() {
  try {
    // First check if the database schema has been updated
    const { schemaUpdated } = await checkVSLASchemaStatus();

    if (!schemaUpdated) {
      console.log("Using fallback VSLA query - schema not updated yet");
      return await getVSLAsFallback();
    }

    // Use the full query with all new fields
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
        // New fields from comprehensive VSLA schema
        primary_business: vslas.primary_business,
        primary_business_other: vslas.primary_business_other,
        region: vslas.region,
        county: vslas.county,
        meeting_location: vslas.meeting_location,
        formation_date: vslas.formation_date,
        closing_date: vslas.closing_date,
        lc1_chairperson_name: vslas.lc1_chairperson_name,
        lc1_chairperson_contact: vslas.lc1_chairperson_contact,
        has_constitution: vslas.has_constitution,
        has_signed_constitution: vslas.has_signed_constitution,
        bank_name: vslas.bank_name,
        bank_branch: vslas.bank_branch,
        bank_account_number: vslas.bank_account_number,
        registration_certificate_number: vslas.registration_certificate_number,
        sacco_member: vslas.sacco_member,
        notes: vslas.notes,
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

    return { success: true, data: vslaList };
  } catch (error) {
    console.error("Error fetching VSLAs:", error);

    // If there's an error with the full query, try fallback
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("column") &&
      errorMessage.includes("does not exist")
    ) {
      console.log("Schema error detected, using fallback query");
      return await getVSLAsFallback();
    }

    if (errorMessage.includes("ETIMEDOUT")) {
      return {
        success: false,
        error:
          "Database connection timeout. Please check your network connection and try again.",
      };
    }

    return { success: false, error: "Failed to fetch VSLAs" };
  }
}

export async function getVSLA(id: string) {
  try {
    const vsla = await db
      .select({
        id: vslas.id,
        name: vslas.name,
        code: vslas.code,
        description: vslas.description,
        primary_business: vslas.primary_business,
        primary_business_other: vslas.primary_business_other,
        organization_id: vslas.organization_id,
        cluster_id: vslas.cluster_id,
        project_id: vslas.project_id,
        country: vslas.country,
        region: vslas.region,
        district: vslas.district,
        county: vslas.county,
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
        meeting_location: vslas.meeting_location,
        formation_date: vslas.formation_date,
        closing_date: vslas.closing_date,
        lc1_chairperson_name: vslas.lc1_chairperson_name,
        lc1_chairperson_contact: vslas.lc1_chairperson_contact,
        has_constitution: vslas.has_constitution,
        has_signed_constitution: vslas.has_signed_constitution,
        bank_name: vslas.bank_name,
        bank_branch: vslas.bank_branch,
        bank_account_number: vslas.bank_account_number,
        registration_certificate_number: vslas.registration_certificate_number,
        sacco_member: vslas.sacco_member,
        notes: vslas.notes,
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
      .leftJoin(projects, eq(vslas.project_id, projects.id))
      .where(eq(vslas.id, id))
      .limit(1);

    if (!vsla.length) {
      return { success: false, error: "VSLA not found" };
    }

    return { success: true, data: vsla[0] };
  } catch (error) {
    console.error("Error fetching VSLA:", error);
    return { success: false, error: "Failed to fetch VSLA" };
  }
}
