"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationId } from "@/features/auth/actions";
import {
  getCurrentOrganizationWithCluster,
  getOrganizationsByCluster,
} from "@/features/organizations/actions/organizations";
import { importParticipants } from "@/features/participants/actions/import-participants";
import { type ValidationError } from "@/features/participants/components/import/types";
import { type ParticipantFormValues } from "@/features/participants/components/participant-form";

export function useExcelImport(clusterId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ParticipantFormValues[] | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [sheets, setSheets] = useState<string[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Fetch organization data for context
  const { data: organizationId } = useQuery({
    queryKey: ["organizationId"] as const,
    queryFn: getOrganizationId,
  });

  const { data: organization } = useQuery({
    queryKey: ["currentOrganization", organizationId] as const,
    queryFn: async () => {
      if (!organizationId) return null;
      const result = await getCurrentOrganizationWithCluster(organizationId);
      return result.success ? result.data : null;
    },
    enabled: !!organizationId,
  });

  // Fetch all organizations in the cluster for mapping
  const { data: clusterOrganizations } = useQuery({
    queryKey: [
      "clusterOrganizations",
      organization?.cluster?.id || organization?.cluster_id,
    ] as const,
    queryFn: async () => {
      const clusterIdRef =
        organization?.cluster?.id || organization?.cluster_id;
      if (!clusterIdRef) return [] as Array<{ id: string; name: string }>;
      const result = await getOrganizationsByCluster(clusterIdRef);
      if (result.success && Array.isArray(result.data)) {
        return result.data.map((o: { id: string; name: string }) => ({
          id: o.id,
          name: o.name,
        }));
      }
      return [] as Array<{ id: string; name: string }>;
    },
    enabled: !!(organization?.cluster?.id || organization?.cluster_id),
  });

  const validateParticipantData = (
    data: Record<string, unknown>,
    _rowIndex: number
  ): {
    participant: ParticipantFormValues | null;
    errors: ValidationError[];
  } => {
    const errors: ValidationError[] = [];

    // Extract and validate name - only require first name, last name is optional
    let firstName = "";
    let lastName = "";
    const nameStr = (data.Name ||
      data.name ||
      data.FullName ||
      data.full_name) as string;
    if (nameStr) {
      const nameParts = nameStr.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    } else {
      firstName = (data.FirstName ||
        data.first_name ||
        data.firstName ||
        "") as string;
      lastName = (data.LastName ||
        data.last_name ||
        data.lastName ||
        "") as string;
    }

    // Use default for missing first name
    if (!firstName.trim()) {
      firstName = "Unknown"; // Default value instead of error
    }

    // Validate and normalize sex - use default if missing
    let sex = (data.Sex || data.sex || data.Gender || data.gender || "")
      .toString()
      .toLowerCase();
    if (sex === "f" || sex === "female") {
      sex = "female";
    } else if (sex === "m" || sex === "male") {
      sex = "male";
    } else {
      sex = "other"; // Default value instead of error
    }

    // Validate age - use default if missing or invalid
    const ageValue = parseInt(String(data.Age || data.age || "0"), 10);
    const finalAge =
      ageValue && ageValue >= 1 && ageValue <= 120 ? ageValue : 18; // Default to 18 if invalid

    // Extract date of birth - look for various column names
    const dateOfBirthRaw =
      data["Date of birth"] || // Your exact column name
      data["Date of Birth"] ||
      data["DateOfBirth"] ||
      data["date_of_birth"] ||
      data.dateOfBirth ||
      data.DOB ||
      data.dob ||
      data["Birth Date"] ||
      data["BirthDate"] ||
      data.birthDate ||
      data["Date Of Birth"] ||
      data["DATE OF BIRTH"] ||
      data["date of birth"] || // lowercase version
      data.DateBirth ||
      data["Birth day"] ||
      data["Birthday"] ||
      data.birthday ||
      "";

    let dateOfBirth = "";
    if (dateOfBirthRaw) {
      console.log(
        "Raw date of birth value:",
        dateOfBirthRaw,
        typeof dateOfBirthRaw
      );
      try {
        // Handle Excel date serial numbers or date strings
        let dateValue: Date;
        if (typeof dateOfBirthRaw === "number") {
          // Excel serial date number
          dateValue = new Date((dateOfBirthRaw - 25569) * 86400 * 1000);
          console.log("Parsed Excel serial date:", dateValue);
        } else {
          // Date string
          dateValue = new Date(dateOfBirthRaw.toString());
          console.log("Parsed date string:", dateValue);
        }

        // Check if the date is valid
        if (
          !isNaN(dateValue.getTime()) &&
          dateValue.getFullYear() > 1900 &&
          dateValue.getFullYear() <= new Date().getFullYear()
        ) {
          dateOfBirth = dateValue.toISOString().split("T")[0]; // Format as YYYY-MM-DD
          console.log("Final dateOfBirth:", dateOfBirth);
        } else {
          console.log("Date validation failed:", {
            isNaN: isNaN(dateValue.getTime()),
            year: dateValue.getFullYear(),
            currentYear: new Date().getFullYear(),
          });
        }
      } catch (error) {
        console.warn("Failed to parse date of birth:", dateOfBirthRaw, error);
      }
    } else {
      console.log("No date of birth raw value found in row");
    }

    // Validate contact - use empty string if missing
    const contact = (
      data["Phone No."] ||
      data.Phone ||
      data.Contact ||
      data.contact ||
      ""
    )
      .toString()
      .trim();

    // Map subcounty to organization based on specified requirements
    const mapSubCountyToOrgKeyword = (subCountyName: string) => {
      const s = subCountyName.trim().toLowerCase();

      // Blessed Pillars Foundation subcounties
      const blessedPillars = ["ruteete", "kiko", "harugongo"];

      // Kazi Women Foundation subcounties
      const kaziWomen = ["bugaaki", "hakibaale", "busoro"];

      // Balinda Children's Foundation subcounties
      const balindaChildren = ["kyarusozi", "kyembogo"];

      if (blessedPillars.includes(s)) return "blessed pillars";
      if (kaziWomen.includes(s)) return "kazi women";
      if (balindaChildren.includes(s)) return "balinda";
      return null; // Return null for unmapped subcounties
    };

    const resolveOrganizationId = (keyword: string | null): string | null => {
      if (!keyword || !clusterOrganizations) return null;
      const lowerKeyword = keyword.toLowerCase();
      const found = clusterOrganizations.find(org =>
        org.name.toLowerCase().includes(lowerKeyword)
      );
      return found ? found.id : null;
    };

    const subCountyName = (
      data.SubCounty ||
      data["Sub County"] ||
      data.subCounty ||
      data.Subcounty ||
      data.subcounty ||
      data["Sub-County"] ||
      data["Sub_County"] ||
      data["sub county"] ||
      data["sub-county"] ||
      data["sub_county"] ||
      ""
    ).toString();
    const orgKeyword = mapSubCountyToOrgKeyword(subCountyName);
    const mappedOrgId = resolveOrganizationId(orgKeyword);

    // Use mapped organization ID or fall back to current user's organization
    const organizationIdToUse = mappedOrgId || organizationId || "";

    // Extract PWD status with debugging
    const pwdRaw =
      data.Disability ||
      data["Disability?"] ||
      data.isPWD ||
      data.PWD ||
      data.pwd ||
      data["Person with Disability"] ||
      data["Person With Disability"] ||
      data["PERSON WITH DISABILITY"] ||
      data["Disabled"] ||
      data.disabled ||
      data["Special Needs"] ||
      data["special needs"] ||
      "";
    console.log("PWD raw value:", pwdRaw, "Type:", typeof pwdRaw);

    const isPWDValue = pwdRaw
      .toString()
      .toLowerCase()
      .match(/(yes|true|1|disabled|pwd|disability|special needs)/i)
      ? "yes"
      : "no";
    console.log("Final isPWD value:", isPWDValue);

    // Create participant object
    const participant: ParticipantFormValues = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex: sex as "male" | "female" | "other",
      age: finalAge.toString(),
      dateOfBirth: dateOfBirth || undefined, // Include date of birth
      contact: contact.trim(),
      isPWD: isPWDValue,
      isMother: "no",
      isRefugee: "no",
      project_id: (data.Project || data.project_id || "").toString(),
      cluster_id: clusterId,
      organization_id: organizationIdToUse || "",
      country: (data.Country || data.country || "Uganda").toString(),
      district: (
        data.District ||
        data.district ||
        organization?.district ||
        ""
      ).toString(),
      subCounty: subCountyName,
      parish: (data.Parish || data.parish || "").toString(),
      village: (data.Village || data.village || "").toString(),
      designation: (
        data["Employment status"] ||
        data.Designation ||
        data.designation ||
        "Other"
      ).toString(),
      enterprise: (
        data["Skill of Interest"] ||
        data.Enterprise ||
        data.enterprise ||
        "Other"
      ).toString(),
      noOfTrainings: "0",
      isActive: "yes",
      isPermanentResident: (
        data["Permanent Resident"] ||
        data.isPermanentResident ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      areParentsAlive: (
        data["Both parents alive"] ||
        data.areParentsAlive ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      numberOfChildren: String(
        parseInt(
          String(data["No. of children"] || data.numberOfChildren || "0"),
          10
        ) || "0"
      ),
      employmentStatus: (
        data["Employment status"] ||
        data.employmentStatus ||
        "unemployed"
      )
        .toString()
        .toLowerCase(),
      monthlyIncome: String(
        parseInt(
          String(data["Monthly income (UGX)"] || data.monthlyIncome || "0"),
          10
        ) || "0"
      ),

      // Add missing required fields
      disabilityType: "", // Type of disability (empty by default)

      // Employment tracking fields
      wageEmploymentStatus: "",
      wageEmploymentSector: "",
      wageEmploymentScale: "",
      selfEmploymentStatus: "",
      selfEmploymentSector: "",
      businessScale: "",
      secondaryEmploymentStatus: "",
      secondaryEmploymentSector: "",
      secondaryBusinessScale: "",

      // Financial inclusion fields
      accessedLoans: "no",
      individualSaving: "no",
      groupSaving: "no",

      // Location classification
      locationSetting: "rural",

      mainChallenge: (
        data["Main Challenge"] ||
        data.mainChallenge ||
        ""
      ).toString(),
      skillOfInterest: (
        data["Skill of Interest"] ||
        data.skillOfInterest ||
        ""
      ).toString(),
      expectedImpact: (
        data["Expected Impact"] ||
        data.expectedImpact ||
        ""
      ).toString(),
      isWillingToParticipate: (
        data["Willingness to Participate"] ||
        data.isWillingToParticipate ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
    };

    return {
      participant: participant, // Always return participant since we use defaults for missing data
      errors,
    };
  };

  const parseFile = async (file: File): Promise<{ sheets: string[] }> => {
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      setWorkbook(wb);
      setSheets(wb.SheetNames);
      return { sheets: wb.SheetNames };
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse Excel file");
      return { sheets: [] };
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = async (
    file: File,
    sheetName: string
  ): Promise<{ errors: ValidationError[] }> => {
    setIsProcessing(true);
    try {
      if (!workbook) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        setWorkbook(wb);
      }

      const worksheet = workbook!.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
        string,
        unknown
      >[];

      const validParticipants: ParticipantFormValues[] = [];

      jsonData.forEach((row, index) => {
        // Debug: Log the first row to see column headers
        if (index === 0) {
          console.log("Excel columns found:", Object.keys(row));
          console.log("Sample row data:", row);

          // Specifically check for your columns
          console.log("Date of birth column:", row["Date of birth"]);
          console.log("PWD column:", row["PWD"]);
          console.log("Name column:", row["Name"]);
          console.log("District column:", row["District"]);
        }

        // Skip completely empty rows
        const hasAnyData = Object.values(row).some(
          value =>
            value !== null && value !== undefined && String(value).trim() !== ""
        );

        if (!hasAnyData) {
          return; // Skip empty rows
        }

        const { participant } = validateParticipantData(row, index);

        // Debug: Log participant data for first few rows
        if (index < 3) {
          console.log(`Row ${index + 1} participant:`, {
            firstName: participant?.firstName,
            lastName: participant?.lastName,
            dateOfBirth: participant?.dateOfBirth,
            isPWD: participant?.isPWD,
            age: participant?.age,
          });
        }

        if (participant) {
          validParticipants.push(participant);
        }
      });

      setValidationErrors([]); // No errors since we use defaults
      setParsedData(validParticipants);

      return { errors: [] }; // No validation errors
    } catch (error) {
      console.error("Validation error:", error);
      const errorList: ValidationError[] = [
        {
          row: 1,
          field: "general",
          message: error instanceof Error ? error.message : "Validation failed",
        },
      ];
      setValidationErrors(errorList);
      return { errors: errorList };
    } finally {
      setIsProcessing(false);
    }
  };

  const importData = async (
    data: ParticipantFormValues[]
  ): Promise<{ success: boolean; imported?: number; error?: string }> => {
    setIsImporting(true);
    try {
      const result = await importParticipants(data);
      if (result.success) {
        return { success: true, imported: data.length };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Import error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      };
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setParsedData(null);
    setValidationErrors([]);
    setSheets([]);
    setWorkbook(null);
    setIsProcessing(false);
    setIsImporting(false);
  };

  return {
    sheets,
    parsedData,
    validationErrors,
    isProcessing,
    isImporting,
    parseFile,
    validateData,
    importData,
    resetImport,
  };
}
