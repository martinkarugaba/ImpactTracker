import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns The text with each word capitalized
 */
export function capitalizeWords(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats a contact number by adding a leading zero if it doesn't already have one
 * @param contact - The contact number to format
 * @returns The formatted contact number with leading zero if needed
 */
export function formatContact(contact: string): string {
  if (!contact) return "";

  // Remove any whitespace and non-digit characters except for the leading plus sign
  const cleaned = contact.trim().replace(/[^\d+]/g, "");

  // If the number already starts with 0 or +, return as is
  if (cleaned.startsWith("0") || cleaned.startsWith("+")) {
    return cleaned;
  }

  // If it's a valid phone number without leading zero, add it
  if (cleaned.length >= 9 && /^\d+$/.test(cleaned)) {
    return "0" + cleaned;
  }

  // Return original if it doesn't match expected pattern
  return contact;
}

/**
 * Formats a number as currency with proper thousands separators and decimal places
 * @param amount - The amount to format
 * @param currency - The currency code (default: "UGX")
 * @param locale - The locale for formatting (default: "en-UG")
 * @param options - Additional formatting options
 * @returns The formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "UGX",
  locale: string = "en-UG",
  options?: Partial<Intl.NumberFormatOptions>
): string {
  if (amount === null || amount === undefined || amount === "") return "";

  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return "";

  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(numericAmount);
  } catch (_error) {
    // Fallback to basic formatting if locale is not supported
    const formatted = numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${currency} ${formatted}`;
  }
}
