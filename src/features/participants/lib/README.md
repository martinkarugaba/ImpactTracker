# Export Utilities

This module provides utilities for exporting participant data to CSV and Excel
formats.

## Features

- **CSV Export**: Export filtered participant data to CSV format
- **Excel Export**: Export filtered participant data to Excel-compatible format
- **Smart Filtering**: Export respects all active filters (project,
  organization, district, subcounty, enterprise, sex, disability, age group)
- **Search Integration**: Export includes search term filtering
- **Dynamic Filenames**: Generated filenames include date and active filter
  information

## Usage

### In Participant Container

```typescript
import {
  participantsToCSV,
  participantsToExcel,
  downloadCSV,
  downloadExcel,
  generateExportFilename,
} from "../lib/export-utils";

// Export as CSV
const csvContent = participantsToCSV(participantData);
const filename = generateExportFilename("participants", filters, "csv");
downloadCSV(csvContent, filename);

// Export as Excel
const excelContent = participantsToExcel(participantData);
const filename = generateExportFilename("participants", filters, "excel");
downloadExcel(excelContent, filename);
```

## File Naming Convention

Exported files follow this naming pattern:

- `participants_YYYY-MM-DD.csv` (no filters)
- `participants_YYYY-MM-DD_filtered-project-ABC-district-123.csv` (with filters)
- `participants_YYYY-MM-DD_filtered-search-john.xlsx` (with search)

## Exported Fields

The following participant fields are included in exports:

- First Name
- Last Name
- Sex
- Age
- Date of Birth
- Designation
- Enterprise
- Phone Number
- Email
- NIN
- Is PWD
- PWD Category
- Organization (name)
- Project (name)
- District (name)
- Sub County (name)
- Country (name)
- Created At

## Technical Notes

- CSV exports use UTF-8 encoding with proper escaping
- Excel exports currently use CSV format (readable by Excel)
- All exports include headers row
- Empty fields are exported as empty strings
- Dates are formatted in local date format
