import { type Participant } from "../types/types";

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
    "Designation",
    "Enterprise",
    "Contact",
    "Is PWD",
    "Organization",
    "Project",
    "District",
    "Sub County",
    "Country",
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
        `"${participant.designation || ""}"`,
        `"${participant.enterprise || ""}"`,
        `"${participant.contact || ""}"`,
        `"${participant.isPWD || ""}"`,
        `"${(participant as ParticipantForExport).organizationName || ""}"`,
        `"${(participant as ParticipantForExport).projectName || ""}"`,
        `"${(participant as ParticipantForExport).districtName || ""}"`,
        `"${(participant as ParticipantForExport).subCountyName || ""}"`,
        `"${(participant as ParticipantForExport).countyName || ""}"`,
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

// Convert participant data to Excel format (using CSV as Excel can read CSV)
export function participantsToExcel(participants: Participant[]): string {
  // For now, we'll use CSV format which Excel can open
  // In the future, we could use a library like SheetJS for proper Excel format
  return participantsToCSV(participants);
}

// Download Excel file
export function downloadExcel(excelContent: string, filename: string): void {
  const blob = new Blob([excelContent], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;",
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
