"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";
import { importVSLAs } from "../../actions/import-vslas";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";

interface ImportVSLAsProps {
  organizations: Organization[];
  clusters: Cluster[];
  projects: Project[];
  onImportComplete?: () => void;
}

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

export function ImportVSLAs({
  organizations,
  clusters,
  projects,
  onImportComplete,
}: ImportVSLAsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<VSLAImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  // Map Excel column names to expected field names
  const mapExcelColumns = (
    row: Record<string, string | number | boolean | null | undefined>
  ): Partial<VSLAImportData> => {
    // Helper to safely convert values to string or undefined
    const toString = (
      val: string | number | boolean | null | undefined
    ): string | undefined => {
      if (val === null || val === undefined || val === "") return undefined;
      return String(val);
    };

    // Build notes from Secretary and Treasurer info since they're not in the schema
    const additionalNotes: string[] = [];
    const secretary = toString(row["Secretary"]);
    const secretaryContact = toString(row["Secretary Contact"]);
    const treasurer = toString(row["Treasurer"]);
    const treasurerContact = toString(row["Treasurer Contact"]);

    if (secretary) {
      additionalNotes.push(`Secretary: ${secretary}`);
    }
    if (secretaryContact) {
      additionalNotes.push(`Secretary Contact: ${secretaryContact}`);
    }
    if (treasurer) {
      additionalNotes.push(`Treasurer: ${treasurer}`);
    }
    if (treasurerContact) {
      additionalNotes.push(`Treasurer Contact: ${treasurerContact}`);
    }

    const existingNotes =
      toString(row["Notes"]) || toString(row["notes"]) || "";
    const combinedNotes =
      additionalNotes.length > 0
        ? `${existingNotes ? existingNotes + "\n" : ""}${additionalNotes.join("\n")}`
        : existingNotes || undefined;

    return {
      name: toString(row["Name"]) || toString(row["name"]),
      code: toString(row["Code"]) || toString(row["code"]),
      description: toString(row["Description"]) || toString(row["description"]),
      primary_business:
        toString(row["Primary Business"]) ||
        toString(row["primary_business"]) ||
        "Others",
      primary_business_other:
        toString(row["Primary Business Other"]) ||
        toString(row["primary_business_other"]),
      organization_name:
        toString(row["Organization"]) ||
        toString(row["organization_name"]) ||
        toString(row["Organization Name"]),
      cluster_name:
        toString(row["Cluster"]) ||
        toString(row["cluster_name"]) ||
        toString(row["Cluster Name"]),
      project_name:
        toString(row["Project"]) ||
        toString(row["project_name"]) ||
        toString(row["Project Name"]),
      country: toString(row["Country"]) || toString(row["country"]) || "Uganda",
      district: toString(row["District"]) || toString(row["district"]),
      sub_county:
        toString(row["Sub-county"]) ||
        toString(row["Sub County"]) ||
        toString(row["sub_county"]),
      parish: toString(row["Parish"]) || toString(row["parish"]) || "",
      village: toString(row["Village"]) || toString(row["village"]) || "",
      address: toString(row["Address"]) || toString(row["address"]),
      total_members:
        Number(
          row["No. of members"] ||
            row["No. of Members"] ||
            row["total_members"] ||
            row["Total Members"]
        ) || 0,
      total_savings: Number(row["Total Savings"] || row["total_savings"]) || 0,
      total_loans: Number(row["Total Loans"] || row["total_loans"]) || 0,
      meeting_frequency:
        toString(row["Meeting Frequency"]) ||
        toString(row["meeting_frequency"]) ||
        "Weekly",
      meeting_day: toString(row["Meeting Day"]) || toString(row["meeting_day"]),
      meeting_time:
        toString(row["Meeting Time"]) || toString(row["meeting_time"]),
      meeting_location:
        toString(row["Meeting Location"]) || toString(row["meeting_location"]),
      formation_date:
        toString(row["Formation Date"]) ||
        toString(row["formation_date"]) ||
        new Date().toISOString(),
      lc1_chairperson_name:
        toString(row["Chairperson"]) ||
        toString(row["lc1_chairperson_name"]) ||
        toString(row["LC1 Chairperson Name"]),
      lc1_chairperson_contact:
        toString(row["Chairperson Contact"]) ||
        toString(row["lc1_chairperson_contact"]) ||
        toString(row["LC1 Chairperson Contact"]),
      has_constitution:
        toString(row["Has Constitution"]) ||
        toString(row["has_constitution"]) ||
        "no",
      has_signed_constitution:
        toString(row["Has Signed Constitution"]) ||
        toString(row["has_signed_constitution"]) ||
        "no",
      bank_name: toString(row["Bank Name"]) || toString(row["bank_name"]),
      bank_branch: toString(row["Bank Branch"]) || toString(row["bank_branch"]),
      bank_account_number:
        toString(row["Bank Account Number"]) ||
        toString(row["bank_account_number"]),
      registration_certificate_number:
        toString(row["Registration Certificate Number"]) ||
        toString(row["registration_certificate_number"]),
      sacco_member:
        toString(row["SACCO Member"]) || toString(row["sacco_member"]) || "no",
      status: toString(row["Status"]) || toString(row["status"]) || "active",
      notes: combinedNotes,
    };
  };

  const parseExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      // Map columns and validate data
      const errors: string[] = [];
      const validData: VSLAImportData[] = [];

      rawData.forEach((rawRow, index) => {
        const rowNum = index + 2; // Excel row number (header is row 1)
        const row = mapExcelColumns(
          rawRow as Record<string, string | number | boolean | null | undefined>
        ) as VSLAImportData;

        // Required fields validation
        if (!row.name?.trim()) {
          errors.push(`Row ${rowNum}: Name is required`);
        }
        // Generate code from name if not provided
        if (!row.code?.trim() && row.name?.trim()) {
          row.code = row.name
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_")
            .substring(0, 50);
        }
        if (!row.organization_name?.trim()) {
          errors.push(
            `Row ${rowNum}: Organization name is required (add an 'Organization' column)`
          );
        }
        if (!row.cluster_name?.trim()) {
          errors.push(
            `Row ${rowNum}: Cluster name is required (add a 'Cluster' column)`
          );
        }
        if (!row.district?.trim()) {
          errors.push(
            `Row ${rowNum}: District is required (add a 'District' column)`
          );
        }
        // Sub-county, parish already mapped from your columns

        // If no errors for this row, add to valid data
        if (errors.length === validationErrors.length) {
          validData.push(row);
        }
      });

      setValidationErrors(errors);
      setImportData(validData);

      if (errors.length > 0) {
        toast.error(`Found ${errors.length} validation error(s)`);
      } else {
        toast.success(`Parsed ${validData.length} VSLAs successfully`);
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file");
      setValidationErrors([
        "Failed to parse Excel file. Please check the format.",
      ]);
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importVSLAs(
        importData,
        organizations,
        clusters,
        projects
      );

      if (result.success) {
        toast.success(`Successfully imported ${result.imported} VSLAs`);
        if (result.errors && result.errors.length > 0) {
          toast.error(`Failed to import ${result.errors.length} VSLAs`);
        }
        setIsOpen(false);
        setFile(null);
        setImportData([]);
        setValidationErrors([]);
        onImportComplete?.();
      } else {
        toast.error(result.error || "Failed to import VSLAs");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred during import");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "Sample VSLA",
        code: "VSLA001",
        description: "Sample description",
        primary_business: "Agriculture",
        primary_business_other: "",
        organization_name: "Your Organization",
        cluster_name: "Your Cluster",
        project_name: "Your Project",
        country: "Uganda",
        district: "Kampala",
        sub_county: "Central",
        parish: "Parish Name",
        village: "Village Name",
        address: "Optional address",
        total_members: 20,
        total_savings: 1000000,
        total_loans: 500000,
        meeting_frequency: "weekly",
        meeting_day: "monday",
        meeting_time: "14:00",
        meeting_location: "Community Center",
        formation_date: "2024-01-01",
        lc1_chairperson_name: "John Doe",
        lc1_chairperson_contact: "0700000000",
        has_constitution: "yes",
        has_signed_constitution: "yes",
        bank_name: "Bank Name",
        bank_branch: "Branch Name",
        bank_account_number: "1234567890",
        registration_certificate_number: "REG123",
        sacco_member: "yes",
        status: "active",
        notes: "Optional notes",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VSLAs");
    XLSX.writeFile(wb, "vsla_import_template.xlsx");
    toast.success("Template downloaded");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import VSLAs from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with VSLA data. Download the template to see
              the required format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={downloadTemplate}>
                <FileUp className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <div className="flex-1">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>
                      <FileUp className="mr-2 h-4 w-4" />
                      {file ? file.name : "Choose File"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/10">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">
                  Validation Errors ({validationErrors.length})
                </h4>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-red-700 dark:text-red-300">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li>... and {validationErrors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {importData.length > 0 && validationErrors.length === 0 && (
              <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/10">
                <p className="text-sm text-green-800 dark:text-green-400">
                  ✓ Ready to import {importData.length} VSLAs
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setFile(null);
                  setImportData([]);
                  setValidationErrors([]);
                }}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  isImporting ||
                  importData.length === 0 ||
                  validationErrors.length > 0
                }
              >
                {isImporting ? "Importing..." : "Import VSLAs"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <FileUp className="mr-2 h-4 w-4" />
        Import
      </Button>
    </>
  );
}
