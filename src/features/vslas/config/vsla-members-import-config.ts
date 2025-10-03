/**
 * VSLA Members Excel Import Configuration
 * This file defines how VSLA member data should be imported from Excel files
 * Members are linked to existing participants or new participants are created
 */

import type { ExcelImportConfig } from "@/components/shared/excel-import-dialog";
import { importVSLAMembers } from "../actions/import-vsla-members";
import type { VSLA } from "../types";
import {
  toString,
  toNumber,
  toDate,
  getColumnValue,
  validationError,
} from "@/components/shared/excel-import-utils";

export interface VSLAMemberImportData {
  participant_name: string;
  participant_phone: string;
  participant_email?: string;
  vsla_name: string;
  role: string;
  joined_date: string;
  total_savings: number;
  total_loans: number;
  notes?: string;
  // Additional participant fields from Excel
  parish?: string;
  village?: string;
  age?: number;
  sex?: string;
  pwd?: string;
  mother?: string;
  refugee?: string;
  enterprise?: string;
  title?: string;
}

/**
 * Create VSLA member import configuration
 */
export const createVSLAMemberImportConfig = (
  vslas: VSLA[]
): ExcelImportConfig<VSLAMemberImportData> => ({
  featureName: "VSLA Member",
  templateFileName: "vsla_members_import_template.xlsx",

  mapColumns: (row: Record<string, unknown>) => {
    const participantName = toString(
      getColumnValue(row, [
        "NAME",
        "Name",
        "Participant Name",
        "Member Name",
        "Full Name",
      ])
    );
    const phone = toString(
      getColumnValue(row, [
        "CONTACT",
        "Contact",
        "Phone",
        "Phone Number",
        "Mobile",
      ])
    );
    const vslaName = toString(
      getColumnValue(row, ["VSLA Name", "VSLA", "Group Name", "Group"])
    );

    // Provide defaults for empty required fields
    const defaultName = participantName || "Member";
    const defaultPhone = phone || "N/A";
    const defaultVslaName =
      vslaName || (vslas.length > 0 ? vslas[0].name : "Unknown VSLA");
    const role = toString(getColumnValue(row, ["Role", "Position"]));
    const joinedDate = toDate(
      getColumnValue(row, [
        "Joined Date",
        "Date Joined",
        "Join Date",
        "Membership Date",
      ])
    );

    return {
      participant_name: defaultName,
      participant_phone: defaultPhone,
      participant_email:
        toString(getColumnValue(row, ["Email", "Email Address"])) || undefined,
      vsla_name: defaultVslaName,
      role: role || "member",
      joined_date: joinedDate ? joinedDate.toISOString() : "",
      total_savings:
        toNumber(
          getColumnValue(row, ["Savings", "Total Savings", "Initial Savings"])
        ) || 0,
      total_loans:
        toNumber(
          getColumnValue(row, ["Loans", "Total Loans", "Initial Loans"])
        ) || 0,
      notes: toString(getColumnValue(row, ["Notes", "Remarks"])) || undefined,
      // Additional participant fields
      parish: toString(getColumnValue(row, ["Parish", "PARISH"])) || undefined,
      village:
        toString(getColumnValue(row, ["Village", "VILLAGE"])) || undefined,
      age: toNumber(getColumnValue(row, ["Age", "AGE"])) || undefined,
      sex:
        toString(getColumnValue(row, ["Sex", "SEX", "Gender", "GENDER"])) ||
        undefined,
      pwd:
        toString(getColumnValue(row, ["PWD", "Pwd", "Disability"])) ||
        undefined,
      mother:
        toString(getColumnValue(row, ["Mother", "MOTHER", "Is Mother"])) ||
        undefined,
      refugee:
        toString(getColumnValue(row, ["Refugee", "REFUGEE", "Is Refugee"])) ||
        undefined,
      enterprise:
        toString(
          getColumnValue(row, ["Enterprise", "ENTERPRISE", "Business"])
        ) || undefined,
      title: toString(getColumnValue(row, ["Title", "TITLE"])) || undefined,
    };
  },

  validateRow: (row: Partial<VSLAMemberImportData>, rowNum: number) => {
    const errors: string[] = [];

    // Note: Required fields now have defaults, so we skip empty field validation
    // The mapColumns function provides defaults for empty participant_name, participant_phone, and vsla_name

    // Validate role if provided
    if (row.role) {
      const validRoles = ["chairperson", "secretary", "treasurer", "member"];
      if (!validRoles.includes(row.role.toLowerCase())) {
        errors.push(
          validationError(
            rowNum,
            "Role",
            `must be one of: ${validRoles.join(", ")}`
          )
        );
      }
    }

    // Validate numeric fields
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

    // Validate age if provided
    if (row.age !== null && row.age !== undefined) {
      if (row.age < 0 || row.age > 150) {
        errors.push(
          validationError(rowNum, "Age", "must be between 0 and 150")
        );
      }
    }

    return errors;
  },

  importData: async (data: VSLAMemberImportData[]) => {
    return await importVSLAMembers(data, vslas);
  },

  generateTemplate: () => {
    return [
      // Header row
      [
        "Name",
        "Phone",
        "Email",
        "VSLA Name",
        "Role",
        "Joined Date",
        "Savings",
        "Loans",
        "Parish",
        "Village",
        "Age",
        "Sex",
        "PWD",
        "Mother",
        "Refugee",
        "Enterprise",
        "Title",
        "Notes",
      ],
      // Sample rows
      [
        "John Doe",
        "0700123456",
        "john.doe@example.com",
        "Kampala Savings Group",
        "member",
        "2024-01-15",
        "500000",
        "0",
        "Central Parish",
        "Kampala Village",
        "30",
        "Male",
        "No",
        "No",
        "No",
        "Tailoring",
        "Member",
        "Active member",
      ],
      [
        "Jane Smith",
        "0700234567",
        "jane.smith@example.com",
        "Kampala Savings Group",
        "chairperson",
        "2024-01-15",
        "1000000",
        "200000",
        "Central Parish",
        "Nakasero Village",
        "35",
        "Female",
        "No",
        "Yes",
        "No",
        "Retail Shop",
        "Chairperson",
        "Group chairperson",
      ],
      [
        "Bob Johnson",
        "0700345678",
        "",
        "Central Cluster VSLA",
        "treasurer",
        "2024-02-01",
        "750000",
        "100000",
        "West Parish",
        "Mengo Village",
        "28",
        "Male",
        "No",
        "No",
        "No",
        "Agriculture",
        "Treasurer",
        "",
      ],
    ];
  },
});
