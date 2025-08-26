/**
 * Utility functions for calculating age from date of birth
 */

/**
 * Calculate age in years from a date of birth
 * @param dateOfBirth The date of birth as a Date object or string
 * @returns The age in years as an integer
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const birth =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate that a date of birth is reasonable (not in the future, not too old)
 * @param dateOfBirth The date of birth to validate
 * @returns An object with isValid boolean and error message if invalid
 */
export function validateDateOfBirth(dateOfBirth: Date | string): {
  isValid: boolean;
  error?: string;
} {
  const birth =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();

  // Check if date is valid
  if (isNaN(birth.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  // Check if date is in the future
  if (birth > today) {
    return { isValid: false, error: "Date of birth cannot be in the future" };
  }

  // Check if age would be too old (let's say max 120 years)
  const age = calculateAge(birth);
  if (age > 120) {
    return {
      isValid: false,
      error: "Date of birth indicates age over 120 years",
    };
  }

  // Check if age would be negative (redundant with future check, but explicit)
  if (age < 0) {
    return { isValid: false, error: "Date of birth cannot be in the future" };
  }

  return { isValid: true };
}

/**
 * Get age from date of birth with validation
 * @param dateOfBirth The date of birth
 * @param fallbackAge Optional fallback age if date of birth is invalid
 * @returns The calculated age or fallback age
 */
export function getAgeFromDateOfBirth(
  dateOfBirth: Date | string | null | undefined,
  fallbackAge?: number
): number | null {
  if (!dateOfBirth) {
    return fallbackAge ?? null;
  }

  const validation = validateDateOfBirth(dateOfBirth);
  if (!validation.isValid) {
    console.warn("Invalid date of birth:", validation.error);
    return fallbackAge ?? null;
  }

  return calculateAge(dateOfBirth);
}
