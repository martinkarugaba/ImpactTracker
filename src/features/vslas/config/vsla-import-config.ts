/**
 * VSLA Excel Import Configuration
 * This file defines how VSLA data should be imported from Excel files
 */

import type { ExcelImportConfig } from "@/components/shared/excel-import-dialog";
import { importVSLAs } from "../actions/import-vslas";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";
import {
  toString,
  toNumber,
  toDate,
  getColumnValue,
  generateCode,
  validationError,
} from "@/components/shared/excel-import-utils";

export interface VSLAImportData {
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

/**
 * Create VSLA import configuration with required data
 */
export const createVSLAImportConfig = (
  organizations: Organization[],
  clusters: Cluster[],
  projects: Project[]
): ExcelImportConfig<VSLAImportData> => ({
  featureName: "VSLA",
  templateFileName: "vslas_import_template.xlsx",

  mapColumns: (row: Record<string, unknown>) => {
    // Get values with flexible column names
    const name = toString(
      getColumnValue(row, ["Name", "name", "VSLA Name", "Group Name"])
    );
    const totalMembers = toNumber(
      getColumnValue(row, [
        "No. of members",
        "Total Members",
        "total_members",
        "Members",
      ])
    );
    const subCounty = toString(
      getColumnValue(row, ["Sub-county", "Sub County", "sub_county"])
    );
    const parish = toString(getColumnValue(row, ["Parish", "parish"]));
    const village = toString(getColumnValue(row, ["Village", "village"]));
    const secretary = toString(getColumnValue(row, ["Secretary", "secretary"]));
    const treasurer = toString(getColumnValue(row, ["Treasurer", "treasurer"]));

    // Generate notes from Secretary/Treasurer/Chairperson if provided
    const notesParts: string[] = [];
    const chairperson = toString(
      getColumnValue(row, ["Chairperson", "chairperson", "Chair"])
    );
    if (chairperson) notesParts.push(`Chairperson: ${chairperson}`);
    if (secretary) notesParts.push(`Secretary: ${secretary}`);
    if (treasurer) notesParts.push(`Treasurer: ${treasurer}`);
    const notes = notesParts.join("\n");

    const formationDate = toDate(
      getColumnValue(row, ["Formation Date", "formation_date", "Date Formed"])
    );

    return {
      name,
      code:
        toString(getColumnValue(row, ["Code", "code"])) || generateCode(name),
      organization_name: toString(
        getColumnValue(row, [
          "Organization",
          "organization_name",
          "Organization Name",
        ])
      ),
      cluster_name: toString(
        getColumnValue(row, ["Cluster", "cluster_name", "Cluster Name"])
      ),
      project_name: toString(
        getColumnValue(row, ["Project", "project_name", "Project Name"])
      ),
      country:
        toString(getColumnValue(row, ["Country", "country"])) || "Uganda",
      district: toString(getColumnValue(row, ["District", "district"])),
      sub_county: subCounty || "",
      parish: parish || "",
      village: village || "",
      formation_date: formationDate
        ? formationDate.toISOString()
        : new Date().toISOString(),
      total_members: totalMembers || 0,
      total_savings:
        toNumber(
          getColumnValue(row, ["Total Savings", "total_savings", "Savings"])
        ) || 0,
      total_loans:
        toNumber(
          getColumnValue(row, ["Total Loans", "total_loans", "Loans"])
        ) || 0,
      primary_business:
        toString(
          getColumnValue(row, [
            "Primary Business",
            "primary_business",
            "Business",
          ])
        ) || "Others",
      meeting_frequency:
        toString(
          getColumnValue(row, [
            "Meeting Frequency",
            "meeting_frequency",
            "Frequency",
          ])
        ) || "Weekly",
      has_constitution: "no",
      has_signed_constitution: "no",
      sacco_member: "no",
      status: "active",
      notes: notes || toString(getColumnValue(row, ["Notes", "notes"])),
    };
  },

  validateRow: (row: Partial<VSLAImportData>, rowNum: number) => {
    const errors: string[] = [];

    // Required fields
    if (!row.name || row.name.trim() === "") {
      errors.push(
        validationError(rowNum, "Name", "is required and cannot be empty")
      );
    }

    // Organization, Cluster, and location fields are now optional
    // - Organization/Cluster will use user's defaults if not provided
    // - Location fields (district, sub_county, etc.) are optional as not all VSLAs may have complete location data
    // - Formation date will default to current date if not provided

    // Optional validations
    if (row.total_members !== null && row.total_members !== undefined) {
      if (row.total_members < 0) {
        errors.push(
          validationError(rowNum, "Total Members", "must be a positive number")
        );
      }
    }

    if (row.total_savings !== null && row.total_savings !== undefined) {
      if (row.total_savings < 0) {
        errors.push(
          validationError(rowNum, "Total Savings", "must be a positive number")
        );
      }
    }

    if (row.total_loans !== null && row.total_loans !== undefined) {
      if (row.total_loans < 0) {
        errors.push(
          validationError(rowNum, "Total Loans", "must be a positive number")
        );
      }
    }

    return errors;
  },

  importData: async (data: VSLAImportData[]) => {
    return await importVSLAs(data, organizations, clusters, projects);
  },

  generateTemplate: () => {
    return [
      // Header row
      [
        "Name",
        "Code",
        "Organization",
        "Cluster",
        "Project",
        "Country",
        "District",
        "Sub-county",
        "Parish",
        "Village",
        "Formation Date",
        "No. of members",
        "Male Members",
        "Female Members",
        "Total Savings",
        "Total Loans",
        "Share Value",
        "Chairperson",
        "Secretary",
        "Treasurer",
        "Primary Business",
        "Meeting Frequency",
        "Notes",
      ],
      // Sample row
      [
        "Kampala Savings Group",
        "kampala-savings-group",
        "Example Organization",
        "Central Cluster",
        "Economic Empowerment Project",
        "Uganda",
        "Kampala",
        "Central Division",
        "Nakasero Parish",
        "Kololo Village",
        "2024-01-15",
        "25",
        "10",
        "15",
        "5000000",
        "2000000",
        "20000",
        "Jane Doe",
        "John Smith",
        "Mary Johnson",
        "Agriculture",
        "Weekly",
        "Active and growing group",
      ],
    ];
  },
});
