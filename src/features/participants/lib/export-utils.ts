import { type Participant } from "../types/types";

// Export options for configuring name formats
export interface ExportOptions {
  nameFormat: "combined" | "separate";
  includeFullName: boolean;
}

// Extended participant type for export that includes the additional fields
type ParticipantForExport = Participant & {
  organizationName?: string;
  projectName?: string;
  districtName?: string;
  subCountyName?: string;
  countyName?: string;
};

// Convert participant data to CSV format
export function participantsToCSV(
  participants: Participant[],
  options: ExportOptions = { nameFormat: "combined", includeFullName: false }
): string {
  // Build headers based on name format preference
  const nameHeaders = [];
  if (options.nameFormat === "combined") {
    nameHeaders.push("Name");
  } else {
    nameHeaders.push("First Name", "Last Name");
    if (options.includeFullName) {
      nameHeaders.push("Full Name");
    }
  }

  const headers = [
    ...nameHeaders,
    "Sex",
    "Age",
    "Date of Birth",
    "Contact",
    "Is PWD",
    "Marital Status",
    "Education Level",
    "Employment Status",
    "Employment Sector",
    "Monthly Income",
    "Number of Children",
    "Is Refugee",
    "Is Mother",
    "Is Teen Mother",
    "Population Segment",
    "Source of Income",
    "VSLA Member",
    "VSLA Name",
    "Enterprise Owner",
    "Enterprise Name",
    "Enterprise Sector",
    "Business Scale",
    "Has Vocational Skills",
    "Vocational Skills Participations",
    "Vocational Skills Completions",
    "Vocational Skills Certifications",
    "Has Soft Skills",
    "Soft Skills Participations",
    "Soft Skills Completions",
    "Soft Skills Certifications",
    "Has Business Skills",
    "Organization",
    "Project",
    "District",
    "Sub County",
    "Parish",
    "Village",
    "Country",
    "Designation",
    "Enterprise",
    "Created At",
  ];

  const csvContent = [
    headers.join(","),
    ...participants.map(participant => {
      // Build name data based on format preference
      const nameData = [];
      if (options.nameFormat === "combined") {
        const fullName = [participant.firstName, participant.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        nameData.push(`"${fullName}"`);
      } else {
        nameData.push(
          `"${participant.firstName || ""}"`,
          `"${participant.lastName || ""}"`
        );
        if (options.includeFullName) {
          const fullName = [participant.firstName, participant.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          nameData.push(`"${fullName}"`);
        }
      }

      return [
        ...nameData,
        `"${participant.sex || ""}"`,
        `"${participant.age || ""}"`,
        `"${participant.dateOfBirth || ""}"`,
        `"${participant.contact || ""}"`,
        `"${participant.isPWD || ""}"`,
        `"${participant.maritalStatus || ""}"`,
        `"${participant.educationLevel || ""}"`,
        `"${participant.employmentStatus || ""}"`,
        `"${participant.employmentSector || ""}"`,
        `"${participant.monthlyIncome || ""}"`,
        `"${participant.numberOfChildren || ""}"`,
        `"${participant.isRefugee || ""}"`,
        `"${participant.isMother || ""}"`,
        `"${participant.isTeenMother || ""}"`,
        `"${participant.populationSegment || ""}"`,
        `"${participant.sourceOfIncome || ""}"`,
        `"${participant.isSubscribedToVSLA || ""}"`,
        `"${participant.vslaName || ""}"`,
        `"${participant.ownsEnterprise || ""}"`,
        `"${participant.enterpriseName || ""}"`,
        `"${participant.enterpriseSector || ""}"`,
        `"${participant.businessScale || ""}"`,
        `"${participant.hasVocationalSkills || ""}"`,
        `"${Array.isArray(participant.vocationalSkillsParticipations) ? participant.vocationalSkillsParticipations.join("; ") : ""}"`,
        `"${Array.isArray(participant.vocationalSkillsCompletions) ? participant.vocationalSkillsCompletions.join("; ") : ""}"`,
        `"${Array.isArray(participant.vocationalSkillsCertifications) ? participant.vocationalSkillsCertifications.join("; ") : ""}"`,
        `"${participant.hasSoftSkills || ""}"`,
        `"${Array.isArray(participant.softSkillsParticipations) ? participant.softSkillsParticipations.join("; ") : ""}"`,
        `"${Array.isArray(participant.softSkillsCompletions) ? participant.softSkillsCompletions.join("; ") : ""}"`,
        `"${Array.isArray(participant.softSkillsCertifications) ? participant.softSkillsCertifications.join("; ") : ""}"`,
        `"${participant.hasBusinessSkills || ""}"`,
        `"${(participant as ParticipantForExport).organizationName || ""}"`,
        `"${(participant as ParticipantForExport).projectName || ""}"`,
        `"${(participant as ParticipantForExport).districtName || ""}"`,
        `"${(participant as ParticipantForExport).subCountyName || ""}"`,
        `"${participant.parish || ""}"`,
        `"${participant.village || ""}"`,
        `"${(participant as ParticipantForExport).countyName || ""}"`,
        `"${participant.designation || ""}"`,
        `"${participant.enterprise || ""}"`,
        `"${participant.created_at ? new Date(participant.created_at).toLocaleDateString() : ""}"`,
      ].join(",");
    }),
  ].join("\n");

  return csvContent;
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Convert participant data to Excel format (using proper Excel format with SheetJS)
export async function participantsToExcel(
  participants: Participant[],
  options: ExportOptions = { nameFormat: "combined", includeFullName: false }
): Promise<ArrayBuffer> {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Excel export is only supported in browser environment");
  }

  try {
    // Dynamic import to ensure XLSX is loaded in the browser
    const XLSX = await import("xlsx");

    if (!XLSX || !XLSX.utils) {
      throw new Error("XLSX library failed to load properly");
    }

    // Prepare data in the same structure as CSV but as an array of objects
    const data = participants.map(participant => {
      // Build name data based on format preference
      const nameData: Record<string, string> = {};
      if (options.nameFormat === "combined") {
        const fullName = [participant.firstName, participant.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        nameData["Name"] = fullName;
      } else {
        nameData["First Name"] = participant.firstName || "";
        nameData["Last Name"] = participant.lastName || "";
        if (options.includeFullName) {
          const fullName = [participant.firstName, participant.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          nameData["Full Name"] = fullName;
        }
      }

      return {
        ...nameData,
        Sex: participant.sex || "",
        Age: participant.age || "",
        "Date of Birth": participant.dateOfBirth || "",
        Contact: participant.contact || "",
        "Is PWD": participant.isPWD || "",
        "Marital Status": participant.maritalStatus || "",
        "Education Level": participant.educationLevel || "",
        "Employment Status": participant.employmentStatus || "",
        "Employment Sector": participant.employmentSector || "",
        "Monthly Income": participant.monthlyIncome || "",
        "Number of Children": participant.numberOfChildren || "",
        "Is Refugee": participant.isRefugee || "",
        "Is Mother": participant.isMother || "",
        "Is Teen Mother": participant.isTeenMother || "",
        "Population Segment": participant.populationSegment || "",
        "Source of Income": participant.sourceOfIncome || "",
        "VSLA Member": participant.isSubscribedToVSLA || "",
        "VSLA Name": participant.vslaName || "",
        "Enterprise Owner": participant.ownsEnterprise || "",
        "Enterprise Name": participant.enterpriseName || "",
        "Enterprise Sector": participant.enterpriseSector || "",
        "Business Scale": participant.businessScale || "",
        "Has Vocational Skills": participant.hasVocationalSkills || "",
        "Vocational Skills Participations": Array.isArray(
          participant.vocationalSkillsParticipations
        )
          ? participant.vocationalSkillsParticipations.join("; ")
          : "",
        "Vocational Skills Completions": Array.isArray(
          participant.vocationalSkillsCompletions
        )
          ? participant.vocationalSkillsCompletions.join("; ")
          : "",
        "Vocational Skills Certifications": Array.isArray(
          participant.vocationalSkillsCertifications
        )
          ? participant.vocationalSkillsCertifications.join("; ")
          : "",
        "Has Soft Skills": participant.hasSoftSkills || "",
        "Soft Skills Participations": Array.isArray(
          participant.softSkillsParticipations
        )
          ? participant.softSkillsParticipations.join("; ")
          : "",
        "Soft Skills Completions": Array.isArray(
          participant.softSkillsCompletions
        )
          ? participant.softSkillsCompletions.join("; ")
          : "",
        "Soft Skills Certifications": Array.isArray(
          participant.softSkillsCertifications
        )
          ? participant.softSkillsCertifications.join("; ")
          : "",
        "Has Business Skills": participant.hasBusinessSkills || "",
        Organization:
          (participant as ParticipantForExport).organizationName || "",
        Project: (participant as ParticipantForExport).projectName || "",
        District: (participant as ParticipantForExport).districtName || "",
        "Sub County": (participant as ParticipantForExport).subCountyName || "",
        Parish: participant.parish || "",
        Village: participant.village || "",
        Country: (participant as ParticipantForExport).countyName || "",
        Designation: participant.designation || "",
        Enterprise: participant.enterprise || "",
        "Created At": participant.created_at
          ? new Date(participant.created_at).toLocaleDateString()
          : "",
      };
    });

    if (data.length === 0) {
      throw new Error("No data to export");
    }

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns for better readability
    const columnWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15), // Minimum width of 15 characters
    }));
    worksheet["!cols"] = columnWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    // Generate Excel file as ArrayBuffer
    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });

    return buffer as ArrayBuffer;
  } catch (error) {
    console.error("Error creating Excel file:", error);
    throw new Error(
      `Failed to create Excel file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Download Excel file with enhanced error handling and production compatibility
export function downloadExcel(
  excelBuffer: ArrayBuffer,
  filename: string
): void {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.error("Download not supported in server environment");
      return;
    }

    // Check for required APIs
    if (typeof Blob === "undefined") {
      console.error("Blob API not supported");
      throw new Error("Blob API not supported in this browser");
    }

    if (typeof URL === "undefined" || !URL.createObjectURL) {
      console.error("URL.createObjectURL not supported");
      throw new Error("URL.createObjectURL not supported in this browser");
    }

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Try modern download approach first
    if ("showSaveFilePicker" in window) {
      // Use File System Access API if available (Chrome/Edge)
      try {
        interface FileSystemAPI {
          showSaveFilePicker: (options: {
            suggestedName: string;
            types: Array<{
              description: string;
              accept: Record<string, string[]>;
            }>;
          }) => Promise<{
            createWritable: () => Promise<{
              write: (data: Blob) => void;
              close: () => Promise<void>;
            }>;
          }>;
        }

        (window as typeof window & FileSystemAPI)
          .showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "Excel files",
                accept: {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    [".xlsx"],
                },
              },
            ],
          })
          .then(fileHandle => {
            return fileHandle.createWritable();
          })
          .then(writable => {
            writable.write(blob);
            return writable.close();
          })
          .catch((_error: unknown) => {
            // Fall back to traditional download if user cancels or API fails
            console.log("Modern download cancelled or failed, using fallback");
            fallbackDownload(blob, filename);
          });
        return;
      } catch (_error) {
        console.log("Modern download API failed, using fallback");
      }
    }

    // Traditional download approach
    fallbackDownload(blob, filename);
  } catch (error) {
    console.error("Excel download failed:", error);
    throw error;
  }
}

// Fallback download function for broader browser compatibility
function fallbackDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Set download attributes
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  // Append to DOM, click, and cleanup
  document.body.appendChild(link);

  // Trigger download
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format filename with current date and filters
export function generateExportFilename(
  baseFilename: string,
  filters: Record<string, string | undefined>,
  format: "csv" | "excel" = "csv"
): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  // Extract active filters
  const activeFilters: string[] = [];
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all" && value.trim() !== "") {
      activeFilters.push(`${key}-${value}`);
    }
  });

  const filterSuffix =
    activeFilters.length > 0 ? `_filtered-${activeFilters.join("-")}` : "";
  const extension = format === "excel" ? "xlsx" : "csv";

  return `${baseFilename}_${date}${filterSuffix}.${extension}`;
}
