"use server";

import { db } from "@/lib/db";
import { vslas } from "@/lib/db/schema";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";

interface VSLAImportData {
  name: string;
  code: string;
  description?: string;
  primary_business: string;
  primary_business_other?: string;
  organization_name: string;
  cluster_name: string;
  project_name?: string;
  country: string;
  district: string;
  sub_county: string;
  parish: string;
  village: string;
  address?: string;
  total_members: number;
  total_savings: number;
  total_loans: number;
  meeting_frequency: string;
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  formation_date: string;
  lc1_chairperson_name?: string;
  lc1_chairperson_contact?: string;
  has_constitution: string;
  has_signed_constitution: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account_number?: string;
  registration_certificate_number?: string;
  sacco_member: string;
  status: string;
  notes?: string;
}

export async function importVSLAs(
  data: VSLAImportData[],
  organizations: Organization[],
  clusters: Cluster[],
  projects: Project[]
) {
  console.log("=== Starting VSLA Import ===");
  console.log("Data to import:", data.length, "VSLAs");
  console.log("Available organizations:", organizations.length);
  console.log("Available clusters:", clusters.length);
  console.log("Available projects:", projects.length);

  // Log first row for debugging
  if (data.length > 0) {
    console.log("Sample data (first row):", JSON.stringify(data[0], null, 2));
  }

  try {
    let imported = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        console.log(`Processing VSLA: ${row.name}`);

        // Find organization by name, or use first available (user's organization) as default
        let organization = organizations.find(
          org =>
            org.name.toLowerCase() === row.organization_name.toLowerCase() ||
            org.acronym?.toLowerCase() === row.organization_name.toLowerCase()
        );

        // If no organization found and organization_name is empty, use first available (user's org)
        if (
          !organization &&
          (!row.organization_name || row.organization_name.trim() === "")
        ) {
          organization = organizations[0];
          console.log(`Using default organization: ${organization?.name}`);
        }

        if (!organization) {
          errors.push(
            `Organization "${row.organization_name}" not found for VSLA "${row.name}"`
          );
          continue;
        }

        // Find cluster by name, or use first available (user's cluster) as default
        let cluster = clusters.find(
          c => c.name.toLowerCase() === row.cluster_name.toLowerCase()
        );

        // If no cluster found and cluster_name is empty, use first available (user's cluster)
        if (!cluster && (!row.cluster_name || row.cluster_name.trim() === "")) {
          cluster = clusters[0];
          console.log(`Using default cluster: ${cluster?.name}`);
        }

        if (!cluster) {
          errors.push(
            `Cluster "${row.cluster_name}" not found for VSLA "${row.name}"`
          );
          continue;
        }

        // Find project by name (optional)
        let projectId: string | undefined = undefined;
        if (row.project_name) {
          const project = projects.find(
            p =>
              p.name.toLowerCase() === row.project_name!.toLowerCase() ||
              p.acronym?.toLowerCase() === row.project_name!.toLowerCase()
          );
          projectId = project?.id;
        }

        // If no project found but project_name was provided, use first available project as default
        if (!projectId && projects.length > 0) {
          projectId = projects[0].id;
        }

        if (!projectId) {
          errors.push(
            `No project available for VSLA "${row.name}". At least one project must exist.`
          );
          continue;
        }

        // Parse formation date
        let formationDate: Date;
        try {
          formationDate = new Date(row.formation_date);
          if (isNaN(formationDate.getTime())) {
            errors.push(`Invalid formation date for VSLA "${row.name}"`);
            continue;
          }
        } catch {
          errors.push(`Invalid formation date for VSLA "${row.name}"`);
          continue;
        }

        // Insert VSLA
        await db.insert(vslas).values({
          name: row.name,
          code: row.code,
          description: row.description || null,
          primary_business: row.primary_business,
          primary_business_other: row.primary_business_other || null,
          organization_id: organization.id,
          cluster_id: cluster.id,
          project_id: projectId,
          country: row.country || "Uganda",
          region: null,
          district: row.district || "Not Specified",
          county: null,
          sub_county: row.sub_county || "Not Specified",
          parish: row.parish || "Not Specified",
          village: row.village || "Not Specified",
          address: row.address || null,
          total_members: Number(row.total_members) || 0,
          total_savings: Number(row.total_savings) || 0,
          total_loans: Number(row.total_loans) || 0,
          meeting_frequency: row.meeting_frequency,
          meeting_day: row.meeting_day || null,
          meeting_time: row.meeting_time || null,
          meeting_location: row.meeting_location || null,
          formation_date: formationDate,
          closing_date: null,
          lc1_chairperson_name: row.lc1_chairperson_name || null,
          lc1_chairperson_contact: row.lc1_chairperson_contact || null,
          has_constitution: row.has_constitution || "no",
          has_signed_constitution: row.has_signed_constitution || "no",
          bank_name: row.bank_name || null,
          bank_branch: row.bank_branch || null,
          bank_account_number: row.bank_account_number || null,
          registration_certificate_number:
            row.registration_certificate_number || null,
          sacco_member: row.sacco_member || "no",
          status: row.status || "active",
          notes: row.notes || null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        imported++;
        console.log(`✓ Successfully imported VSLA: ${row.name}`);
      } catch (error) {
        console.error(`Error importing VSLA "${row.name}":`, error);
        errors.push(
          `Failed to import VSLA "${row.name}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    console.log("=== VSLA Import Complete ===");
    console.log(`Successfully imported: ${imported} VSLAs`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Error details:", errors);
    }

    return {
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error importing VSLAs:", error);
    return {
      success: false,
      error: "Failed to import VSLAs",
      imported: 0,
    };
  }
}
