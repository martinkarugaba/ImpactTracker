"use client";

import { useState } from "react";
import { useAtom } from "jotai";
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
import { getAgeFromDateOfBirth } from "../../../lib/age-calculator";
import { detectDuplicatesBatched } from "@/features/participants/actions/detect-duplicates";
import type {
  DuplicateAnalysisResult,
  DuplicateMatch,
} from "../duplicate-detection";
import {
  startImportAtom,
  updateImportProgressAtom,
  completeImportAtom,
} from "../../../atoms/import-progress-atoms";
// import { mapLocationNames } from "@/features/locations/actions/location-search";

// Helper function to validate enum values
function validateEnumValue<T extends string>(
  value: string | undefined,
  validValues: T[]
): T | undefined {
  if (!value) return undefined;
  const normalizedValue = value.toString().toLowerCase().trim();
  return (
    validValues.find(v => v.toLowerCase() === normalizedValue) || undefined
  );
}

// Helper function to parse skills arrays from comma-separated values
function parseSkillsArray(value: unknown): string[] {
  if (!value) return [];

  const str = value.toString().trim();
  if (!str) return [];

  // Split by comma and clean up each skill name
  return str
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
}

export function useExcelImport(clusterId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDuplicateDetection, setIsDuplicateDetection] = useState(false);
  const [duplicateProgress, setDuplicateProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [duplicateAnalysis, setDuplicateAnalysis] =
    useState<DuplicateAnalysisResult | null>(null);
  // Use global import progress atoms instead of local state
  const [, startImport] = useAtom(startImportAtom);
  const [, updateImportProgress] = useAtom(updateImportProgressAtom);
  const [, completeImport] = useAtom(completeImportAtom);
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

  // Location mapping helper function (unused for now)
  const _mapLocationNameToId = (
    locationName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locationData: any,
    fallbackValue: string = locationName
  ): string => {
    if (!locationName || !locationData?.success || !locationData?.data?.data) {
      return fallbackValue;
    }

    const found = locationData.data.data.find(
      (item: { name: string; id: string }) =>
        item.name.toLowerCase().trim() === locationName.toLowerCase().trim()
    );

    return found ? found.id : fallbackValue;
  };

  const validateParticipantData = async (
    data: Record<string, unknown>,
    _rowIndex: number
  ): Promise<{
    participant: ParticipantFormValues | null;
    errors: ValidationError[];
  }> => {
    const errors: ValidationError[] = [];

    // Extract and validate name - prioritize First Name and Last Name columns
    let firstName = "";
    let lastName = "";

    // First try to get from separate First Name and Last Name columns
    firstName = (data["First Name"] ||
      data["FirstName"] ||
      data["first_name"] ||
      data["firstName"] ||
      data["FIRST NAME"] ||
      data["First name"] ||
      "") as string;

    lastName = (data["Last Name"] ||
      data["LastName"] ||
      data["last_name"] ||
      data["lastName"] ||
      data["LAST NAME"] ||
      data["Last name"] ||
      "") as string;

    // If separate columns not found, try single Name column
    if (!firstName.trim() && !lastName.trim()) {
      const nameStr = (data.Name ||
        data.name ||
        data.FullName ||
        data.full_name ||
        data["Full Name"] ||
        data["FULL NAME"]) as string;
      if (nameStr && nameStr.trim()) {
        const nameParts = nameStr.trim().split(/\s+/);
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      }
    }

    // Skip this row if no name is found at all - don't create Debug participants
    if (!firstName.trim() && !lastName.trim()) {
      return {
        participant: null,
        errors: [
          {
            row: _rowIndex + 1,
            field: "name",
            message: "No name found in First Name, Last Name, or Name columns",
          },
        ],
      };
    }

    // Ensure we have at least a first name
    if (!firstName.trim()) {
      firstName = lastName; // Use last name as first name if first name is empty
      lastName = ""; // Clear last name
    }

    // Validate and normalize sex/gender - use default if missing
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

    // Validate age - try to get from date of birth first, then fall back to age column
    const ageValue = parseInt(String(data.Age || data.age || "0"), 10);
    const fallbackAge =
      ageValue && ageValue >= 1 && ageValue <= 120 ? ageValue : 18;

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
    let calculatedAge = fallbackAge; // Default to fallback age

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

          // Calculate age from date of birth
          const ageFromDOB = getAgeFromDateOfBirth(dateOfBirth, fallbackAge);
          if (ageFromDOB !== null) {
            calculatedAge = ageFromDOB;
            console.log("Calculated age from DOB:", calculatedAge);
          }
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
      console.log(
        "No date of birth raw value found, using age from Age column or default"
      );
    }

    // Validate contact/phone - use empty string if missing
    const contact = (
      data["Phone No."] ||
      data["Phone No"] ||
      data.Phone ||
      data.phone ||
      data.Contact ||
      data.contact ||
      data.Mobile ||
      data.mobile ||
      data.Telephone ||
      data.telephone ||
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
      const balindaChildren = [
        "kyarusozi",
        "kyembogo",
        "kyarusozi town council",
      ];

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

    // Extract location names from Excel data
    const countryName = (data.Country || data.country || "Uganda").toString();
    const districtName = (
      data.District ||
      data.district ||
      organization?.district ||
      ""
    ).toString();
    const parishName = (data.Parish || data.parish || "").toString();
    const villageName = (data.Village || data.village || "").toString();

    // Location mapping temporarily disabled until location tables are set up
    // const locationMapping = await mapLocationNames({
    //   country: countryName,
    //   district: districtName,
    //   subCounty: subCountyName,
    //   parish: parishName,
    //   village: villageName,
    // });

    // Use original names for now
    const finalCountry = countryName;
    const finalDistrict = districtName;
    const finalSubCounty = subCountyName;
    const finalParish = parishName;
    const finalVillage = villageName;

    // Store location IDs as null for now (no mapping)
    const locationIds = {
      country_id: null,
      district_id: null,
      subcounty_id: null,
      parish_id: null,
      village_id: null,
    };

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
      age: calculatedAge.toString(), // Use calculated age from DOB or fallback
      dateOfBirth: dateOfBirth || undefined, // Include date of birth
      contact: contact.trim(),
      isPWD: isPWDValue,
      isMother: "no",
      isRefugee: (
        data["Refugee"] ||
        data["refugee"] ||
        data["REFUGEE"] ||
        data.isRefugee ||
        data.refugee ||
        data["Refugee Status"] ||
        data["refugee status"] ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      project_id: (data.Project || data.project_id || "").toString(),
      cluster_id: clusterId,
      organization_id: organizationIdToUse || "",
      country: finalCountry,
      district: finalDistrict,
      subCounty: finalSubCounty,
      parish: finalParish,
      village: finalVillage,
      // Store location IDs when available
      country_id: locationIds.country_id || undefined,
      district_id: locationIds.district_id || undefined,
      subcounty_id: locationIds.subcounty_id || undefined,
      parish_id: locationIds.parish_id || undefined,
      village_id: locationIds.village_id || undefined,
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

      // NEW FIELDS FOR IMPORT
      // Personal Information
      maritalStatus: validateEnumValue(
        (data["Marital Status"] ||
          data["Marital status"] ||
          data["MARITAL STATUS"] ||
          data.maritalStatus ||
          data.MaritalStatus ||
          data["marital status"] ||
          "") as string,
        ["single", "married", "divorced", "widowed"]
      ),
      educationLevel: validateEnumValue(
        (data["Education Level"] ||
          data["Education level"] ||
          data["EDUCATION LEVEL"] ||
          data.educationLevel ||
          data.EducationLevel ||
          data["education level"] ||
          data.Education ||
          data.education ||
          "") as string,
        ["none", "primary", "secondary", "tertiary", "university"]
      ),
      sourceOfIncome: validateEnumValue(data["Source of Income"] as string, [
        "employment",
        "business",
        "agriculture",
        "remittances",
        "other",
      ]),
      nationality: (data["Nationality"] || "Ugandan").toString(),
      populationSegment: validateEnumValue(
        data["Population Segment"] as string,
        ["youth", "women", "pwd", "elderly", "refugee", "host"]
      ),
      refugeeLocation: (data["Refugee location"] || "").toString(),
      isActiveStudent: (
        data["Active Student"] ||
        data["Active student"] ||
        data["ACTIVE STUDENT"] ||
        data["active student"] ||
        data.isActiveStudent ||
        data.activeStudent ||
        data["Student"] ||
        data["student"] ||
        data["Currently Student"] ||
        data["currently student"] ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",

      // VSLA Information
      isSubscribedToVSLA: (
        data["Subscribed To VSLA"] ||
        data["Subscribed to VSLA"] ||
        data["SUBSCRIBED TO VSLA"] ||
        data["VSLA Subscription"] ||
        data["VSLA Member"] ||
        data["VSLA member"] ||
        data.isSubscribedToVSLA ||
        data.vslaSubscription ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      vslaName: (
        data["VSLA Name"] ||
        data["VSLA name"] ||
        data["vsla name"] ||
        data.vslaName ||
        data.VSLAName ||
        data["Group Name"] ||
        data["Group name"] ||
        ""
      ).toString(),

      // Teen Mother
      isTeenMother: (
        data["Teen Mother"] ||
        data["Teen mother"] ||
        data["TEEN MOTHER"] ||
        data["teen mother"] ||
        data.isTeenMother ||
        data.TeenMother ||
        data["Teenage Mother"] ||
        data["teenage mother"] ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",

      // Enterprise Information
      ownsEnterprise: (
        data["Owns Enterprise"] ||
        data["Owns enterprise"] ||
        data["OWNS ENTERPRISE"] ||
        data["owns enterprise"] ||
        data.ownsEnterprise ||
        data.OwnsEnterprise ||
        data["Has Business"] ||
        data["Has business"] ||
        data["Business Owner"] ||
        data["business owner"] ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      enterpriseName: (
        data["Enterprise Name"] ||
        data["Enterprise name"] ||
        data["ENTERPRISE NAME"] ||
        data["enterprise name"] ||
        data.enterpriseName ||
        data.EnterpriseName ||
        data["Business Name"] ||
        data["Business name"] ||
        data["business name"] ||
        ""
      ).toString(),
      enterpriseSector: validateEnumValue(
        (data["Enterprise Sector"] ||
          data["Enterprise sector"] ||
          data["ENTERPRISE SECTOR"] ||
          data["enterprise sector"] ||
          data.enterpriseSector ||
          data.EnterpriseSector ||
          data["Business Sector"] ||
          data["Business sector"] ||
          data["business sector"] ||
          "") as string,
        [
          "agriculture",
          "retail",
          "services",
          "manufacturing",
          "construction",
          "transport",
          "other",
        ]
      ),
      enterpriseSize: validateEnumValue(
        (data["Enterprise Size"] ||
          data["Enterprise size"] ||
          data["ENTERPRISE SIZE"] ||
          data["enterprise size"] ||
          data.enterpriseSize ||
          data.EnterpriseSize ||
          data["Business Size"] ||
          data["Business size"] ||
          data["business size"] ||
          "") as string,
        ["micro", "small", "medium", "large"]
      ),
      enterpriseYouthMale: String(
        parseInt(String(data["Ent. Youth Male"] || "0"), 10) || "0"
      ),
      enterpriseYouthFemale: String(
        parseInt(String(data["Ent. Youth Female"] || "0"), 10) || "0"
      ),
      enterpriseAdults: String(
        parseInt(String(data["Ent. Adults"] || "0"), 10) || "0"
      ),

      // Skills Information - parse arrays from comma-separated values
      hasVocationalSkills: (data["Has Vocational Skills"] || "")
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      vocationalSkillsParticipations: parseSkillsArray(
        data["Vocational Skills Participations"]
      ),
      vocationalSkillsCompletions: parseSkillsArray(
        data["Vocational Skills Completions"]
      ),
      vocationalSkillsCertifications: parseSkillsArray(
        data["Vocational Skills Certifications"]
      ),

      hasSoftSkills: (data["Has Soft Skills"] || "")
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",
      softSkillsParticipations: parseSkillsArray(
        data["Soft Skills Participations"]
      ),
      softSkillsCompletions: parseSkillsArray(data["Soft Skills Completions"]),
      softSkillsCertifications: parseSkillsArray(
        data["Soft Skills Certifications"]
      ),

      hasBusinessSkills: (data["Has Business Skills"] || "")
        .toString()
        .toLowerCase()
        .includes("yes")
        ? "yes"
        : "no",

      // Employment Details (more specific than existing employmentStatus)
      employmentType: validateEnumValue(
        (data["Employment type"] ||
          data["Employment Type"] ||
          data["EMPLOYMENT TYPE"] ||
          data["employment type"] ||
          data.employmentType ||
          data.EmploymentType ||
          data["Type of Employment"] ||
          data["type of employment"] ||
          "") as string,
        ["formal", "informal", "self-employed", "unemployed"]
      ),
      employmentSector: validateEnumValue(
        (data["Employment sector"] ||
          data["Employment Sector"] ||
          data["EMPLOYMENT SECTOR"] ||
          data["employment sector"] ||
          data.employmentSector ||
          data.EmploymentSector ||
          data["Sector of Employment"] ||
          data["sector of employment"] ||
          "") as string,
        [
          "agriculture",
          "manufacturing",
          "services",
          "trade",
          "education",
          "health",
          "other",
        ]
      ),

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

      for (const [index, row] of jsonData.entries()) {
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
          continue; // Skip empty rows
        }

        const { participant, errors } = await validateParticipantData(
          row,
          index
        );

        // Debug: Log participant data for first few rows
        if (index < 3) {
          console.log(`Row ${index + 1} participant:`, {
            firstName: participant?.firstName,
            lastName: participant?.lastName,
            dateOfBirth: participant?.dateOfBirth,
            isPWD: participant?.isPWD,
            age: participant?.age,
            country: participant?.country,
            district: participant?.district,
            country_id: participant?.country_id,
            district_id: participant?.district_id,
          });
        }

        // Only add participant if validation succeeded and participant exists
        if (participant && errors.length === 0) {
          validParticipants.push(participant);
        } else if (errors.length > 0) {
          console.log(
            `Skipping row ${index + 1} due to validation errors:`,
            errors
          );
        }
      }

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

  const checkForDuplicates = async (
    data: ParticipantFormValues[]
  ): Promise<DuplicateAnalysisResult> => {
    setIsDuplicateDetection(true);

    // Reset progress
    setDuplicateProgress({
      current: 0,
      total: data.length,
      percentage: 0,
    });

    try {
      // For large datasets, use client-side batching to avoid 1MB limit
      if (data.length > 100) {
        console.log(
          `Processing ${data.length} records in client-side batches to avoid 1MB limit`
        );

        const BATCH_SIZE = 50; // Small batches to stay under 1MB
        const totalBatches = Math.ceil(data.length / BATCH_SIZE);

        const combinedExactDuplicates: DuplicateMatch[] = [];
        const combinedPotentialDuplicates: DuplicateMatch[] = [];
        const combinedUniqueRecords: ParticipantFormValues[] = [];
        let totalSkipped = 0;

        for (let i = 0; i < data.length; i += BATCH_SIZE) {
          const batch = data.slice(i, i + BATCH_SIZE);
          const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

          // Update progress
          setDuplicateProgress({
            current: i,
            total: data.length,
            percentage: Math.round((i / data.length) * 100),
          });

          console.log(
            `Processing client batch ${currentBatch}/${totalBatches} (${batch.length} participants)`
          );

          try {
            // Send smaller batch to server
            const batchAnalysis = await detectDuplicatesBatched(
              batch,
              clusterId,
              () => {} // No server-side progress needed since we handle it client-side
            );

            // Combine results
            combinedExactDuplicates.push(...batchAnalysis.exactDuplicates);
            combinedPotentialDuplicates.push(
              ...batchAnalysis.potentialDuplicates
            );
            combinedUniqueRecords.push(...batchAnalysis.uniqueRecords);
            totalSkipped += batchAnalysis.skippedCount;
          } catch (batchError) {
            console.error(`Client batch ${currentBatch} failed:`, batchError);
            // Add batch as unique records if duplicate detection fails
            combinedUniqueRecords.push(...batch);
          }

          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Final progress
        setDuplicateProgress({
          current: data.length,
          total: data.length,
          percentage: 100,
        });

        const analysis = {
          exactDuplicates: combinedExactDuplicates,
          potentialDuplicates: combinedPotentialDuplicates,
          uniqueRecords: combinedUniqueRecords,
          skippedCount: totalSkipped,
        };

        setDuplicateAnalysis(analysis);
        return analysis;
      } else {
        // For smaller datasets, use original approach
        const analysis = await detectDuplicatesBatched(
          data,
          clusterId,
          progress => {
            setDuplicateProgress(progress);
          }
        );

        setDuplicateAnalysis(analysis);
        return analysis;
      }
    } catch (error) {
      console.error("Duplicate detection error:", error);
      toast.error("Failed to check for duplicates");
      // Return all as unique if detection fails
      return {
        exactDuplicates: [],
        potentialDuplicates: [],
        uniqueRecords: data,
        skippedCount: 0,
      };
    } finally {
      setIsDuplicateDetection(false);
      // Reset progress when done
      setDuplicateProgress({
        current: 0,
        total: 0,
        percentage: 0,
      });
    }
  };

  const importData = async (
    data: ParticipantFormValues[]
  ): Promise<{ success: boolean; imported?: number; error?: string }> => {
    setIsImporting(true);

    // Start global import progress
    startImport(data.length);

    try {
      const BATCH_SIZE = 25; // Reduced batch size to stay under 1MB limit
      const totalBatches = Math.ceil(data.length / BATCH_SIZE);
      let totalImported = 0;
      const errors: string[] = [];

      updateImportProgress({ totalBatches });

      // Process data in batches
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

        updateImportProgress({
          currentBatch,
          current: i,
          percentage: Math.round((i / data.length) * 100),
          message: `Processing batch ${currentBatch}/${totalBatches}...`,
        });

        console.log(
          `Processing batch ${currentBatch}/${totalBatches} (${batch.length} participants)`
        );

        try {
          const result = await importParticipants(batch);
          if (result.success) {
            totalImported += batch.length;
            console.log(
              `Batch ${currentBatch} completed: ${batch.length} participants imported`
            );
          } else {
            const error = `Batch ${currentBatch} failed: ${result.error}`;
            console.error(error);
            errors.push(error);

            // Continue with other batches even if one fails
            // You could also choose to stop here by breaking the loop
          }
        } catch (batchError) {
          const error = `Batch ${currentBatch} error: ${batchError instanceof Error ? batchError.message : "Unknown error"}`;
          console.error(error);
          errors.push(error);
        }

        // Small delay between batches to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Complete import with final result
      const finalResult = {
        success: errors.length === 0,
        imported: totalImported,
        error:
          errors.length > 0
            ? `Partial import completed. ${totalImported}/${data.length} participants imported. Errors: ${errors.join("; ")}`
            : undefined,
      };
      completeImport(finalResult);

      if (errors.length > 0) {
        return {
          success: false,
          error: `Partial import completed. ${totalImported}/${data.length} participants imported. Errors: ${errors.join("; ")}`,
        };
      }

      return { success: true, imported: totalImported };
    } catch (error) {
      console.error("Import error:", error);
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      };
      completeImport(errorResult);
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setParsedData(null);
    setValidationErrors([]);
    setSheets([]);
    setWorkbook(null);
    setDuplicateAnalysis(null);
    setIsProcessing(false);
    setIsImporting(false);
    setIsDuplicateDetection(false);
    setDuplicateProgress({
      current: 0,
      total: 0,
      percentage: 0,
    });
    // Note: Global import progress is managed separately and persists after dialog close
  };

  return {
    sheets,
    parsedData,
    validationErrors,
    duplicateAnalysis,
    isProcessing,
    isImporting,
    isDuplicateDetection,
    duplicateProgress,
    parseFile,
    validateData,
    checkForDuplicates,
    importData,
    resetImport,
  };
}
