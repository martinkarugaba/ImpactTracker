import * as XLSX from "xlsx";

export function downloadTemplate() {
  // Sample data with expected format including all requested fields
  const sampleData = [
    {
      Name: "John Doe", // Or use separate FirstName/LastName columns
      Gender: "male", // Accepted values: male, female, other
      "Marital Status": "single", // single, married, divorced, widowed
      Phone: "+256700000000", // Phone number
      "Date of Birth": "1999-01-01", // YYYY-MM-DD format
      Disabled: "no", // yes or no
      Subcounty: "Sample Sub County",
      District: "Sample District",
      Parish: "Sample Parish",
      Village: "Sample Village",
      Project: "", // Project name or leave empty for default
      "Education Level": "secondary", // none, primary, secondary, tertiary, university
      "Source of Income": "employment", // employment, business, agriculture, remittances, other
      "Subscribed To VSLA": "yes", // yes or no
      "VSLA Name": "Sample VSLA Group",
      "Teen Mother": "no", // yes or no
      "Owns Enterprise": "yes", // yes or no
      "Enterprise Name": "Sample Business",
      "Enterprise Sector": "agriculture", // agriculture, retail, services, manufacturing, construction, transport, other
      "Enterprise Size": "micro", // micro, small, medium, large
      "Ent. Youth Male": "1", // Number of youth males in enterprise
      "Ent. Youth Female": "2", // Number of youth females in enterprise
      "Ent. Adults": "3", // Number of adults in enterprise
      "Has Vocational Skills": "yes", // yes or no
      "Vocational Skills Participations": "Carpentry,Tailoring", // Comma-separated list of skills
      "Vocational Skills Completions": "Carpentry", // Comma-separated list of skills
      "Vocational Skills Certifications": "Carpentry", // Comma-separated list of skills
      "Has Soft Skills": "yes", // yes or no
      "Soft Skills Participations": "Leadership", // Comma-separated list of skills
      "Soft Skills Completions": "Leadership", // Comma-separated list of skills
      "Soft Skills Certifications": "", // Comma-separated list of skills
      "Has Business Skills": "no", // yes or no
      Nationality: "Ugandan",
      "Population Segment": "youth", // youth, women, pwd, elderly, refugee, host
      Refugee: "no", // yes or no
      location: "rural", // urban or rural
      "Employment status": "employed", // employed, unemployed, self-employed
      "Employment type": "formal", // formal, informal, self-employed, unemployed
      "Employment sector": "agriculture", // agriculture, manufacturing, services, trade, education, health, other
      "Active Student": "no", // yes or no
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Participants");

  // Add column widths for better readability
  ws["!cols"] = Array(40).fill({ wch: 20 }); // Set all columns to width 20

  XLSX.writeFile(wb, "participants-template.xlsx");
}
