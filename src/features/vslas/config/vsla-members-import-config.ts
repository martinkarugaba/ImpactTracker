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
        "Name",
        "Participant Name",
        "Member Name",
        "Full Name",
      ])
    );
    const phone = toString(
      getColumnValue(row, ["Phone", "Contact", "Phone Number", "Mobile"])
    );
    const vslaName = toString(
      getColumnValue(row, ["VSLA Name", "VSLA", "Group Name", "Group"])
    );
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
      participant_name: participantName,
      participant_phone: phone,
      participant_email:
        toString(getColumnValue(row, ["Email", "Email Address"])) || undefined,
      vsla_name: vslaName,
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
    };
  },

  validateRow: (row: Partial<VSLAMemberImportData>, rowNum: number) => {
    const errors: string[] = [];

    // Required fields
    if (!row.participant_name || row.participant_name.trim() === "") {
      errors.push(
        validationError(
          rowNum,
          "Participant Name",
          "is required and cannot be empty"
        )
      );
    }

    if (!row.participant_phone || row.participant_phone.trim() === "") {
      errors.push(
        validationError(rowNum, "Phone", "is required and cannot be empty")
      );
    }

    if (!row.vsla_name || row.vsla_name.trim() === "") {
      errors.push(
        validationError(rowNum, "VSLA Name", "is required and cannot be empty")
      );
    }

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
        "",
      ],
    ];
  },
});
