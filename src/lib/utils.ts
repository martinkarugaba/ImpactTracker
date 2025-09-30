import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amounts in Ugandan Shillings (UGX)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Capitalize the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns String with each word capitalized
 */
export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format contact/phone numbers with proper spacing
 * @param contact - The contact number to format
 * @returns Formatted contact string
 */
export function formatContact(contact: string): string {
  if (!contact) return "";
  // Remove any non-numeric characters except + at the beginning
  const cleaned = contact.replace(/[^\d+]/g, "");
  // Format as +256 XXX XXX XXX for Uganda numbers
  if (cleaned.startsWith("+256") && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  return contact;
}
