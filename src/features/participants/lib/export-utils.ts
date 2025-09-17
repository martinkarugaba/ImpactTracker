import { type Participant } from "../types/types";
import * as XLSX from "xlsx";

// Extended participant type for export that includes the additional fields
type ParticipantForExport = Participant & {
  organizationName?: string;
  projectName?: string;
  districtName?: string;
  subCountyName?: string;
  countyName?: string;
};

// Convert participant data to CSV format
export function participantsToCSV(participants: Participant[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Sex",
    "Age",
    "Date of Birth",
    "Contact",
    "Is PWD",
    "Marital Status",
    "Education Level",
    "Employment Type",
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
    ...participants.map(participant =>
      [
        `"${participant.firstName || ""}"`,
        `"${participant.lastName || ""}"`,
        `"${participant.sex || ""}"`,
        `"${participant.age || ""}"`,
        `"${participant.dateOfBirth || ""}"`,
        `"${participant.contact || ""}"`,
        `"${participant.isPWD || ""}"`,
        `"${participant.maritalStatus || ""}"`,
        `"${participant.educationLevel || ""}"`,
        `"${participant.employmentType || ""}"`,
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
      ].join(",")
    ),
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
export function participantsToExcel(participants: Participant[]): ArrayBuffer {
  // Prepare data in the same structure as CSV but as an array of objects
  const data = participants.map(participant => ({
    "First Name": participant.firstName || "",
    "Last Name": participant.lastName || "",
    Sex: participant.sex || "",
    Age: participant.age || "",
    "Date of Birth": participant.dateOfBirth || "",
    Contact: participant.contact || "",
    "Is PWD": participant.isPWD || "",
    "Marital Status": participant.maritalStatus || "",
    "Education Level": participant.educationLevel || "",
    "Employment Type": participant.employmentType || "",
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
    "Soft Skills Completions": Array.isArray(participant.softSkillsCompletions)
      ? participant.softSkillsCompletions.join("; ")
      : "",
    "Soft Skills Certifications": Array.isArray(
      participant.softSkillsCertifications
    )
      ? participant.softSkillsCertifications.join("; ")
      : "",
    "Has Business Skills": participant.hasBusinessSkills || "",
    Organization: (participant as ParticipantForExport).organizationName || "",
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
  }));

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
  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });
}

// Download Excel file
export function downloadExcel(
  excelBuffer: ArrayBuffer,
  filename: string
): void {
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
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
