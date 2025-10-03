/**
 * Utility functions for Excel import operations
 */

/**
 * Safely convert any value to string
 */
export function toString(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

/**
 * Safely convert any value to number
 */
export function toNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

/**
 * Safely convert any value to date
 */
export function toDate(val: unknown): Date | null {
  if (!val) return null;
  const date = new Date(val as string | number | Date);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get value from row with multiple possible column names
 * Useful for handling different Excel formats
 *
 * @example
 * getColumnValue(row, ["Sub-county", "Sub County", "sub_county"])
 */
export function getColumnValue(
  row: Record<string, unknown>,
  columnNames: string[]
): unknown {
  for (const name of columnNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
      return row[name];
    }
  }
  return null;
}

/**
 * Generate a code from a name (kebab-case)
 *
 * @example
 * generateCode("Kampala VSLA Group") => "kampala-vsla-group"
 */
export function generateCode(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format validation error message with row number
 */
export function validationError(
  rowNum: number,
  field: string,
  message: string
): string {
  return `Row ${rowNum}: ${field} - ${message}`;
}
