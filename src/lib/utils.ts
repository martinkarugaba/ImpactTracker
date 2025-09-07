import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "UGX",
  locale: string = "en-UG"
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value
  );
}

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Capitalizes the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Calculates age from date of birth
 * @param dateOfBirth - The date of birth (Date object or string)
 * @returns The calculated age in years
 */
export function calculateAge(dateOfBirth: Date | string | null): number | null {
  if (!dateOfBirth) return null;

  const birthDate =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Formats a phone number with a leading zero
 * @param contact - The contact number to format
 * @returns The formatted contact number with leading zero
 */
export function formatContact(contact: string): string {
  if (!contact) return "";

  // Remove any non-digit characters except + at the beginning
  const cleaned = contact.replace(/[^\d+]/g, "");

  // If it starts with +256 (Uganda), format accordingly
  if (cleaned.startsWith("+256")) {
    const number = cleaned.substring(4);
    return `0${number}`;
  }

  // If it starts with 256, format accordingly
  if (cleaned.startsWith("256") && cleaned.length > 3) {
    const number = cleaned.substring(3);
    return `0${number}`;
  }

  // If it already starts with 0, return as is
  if (cleaned.startsWith("0")) {
    return cleaned;
  }

  // Otherwise, add leading zero
  return `0${cleaned}`;
}

/**
 * Generates a consistent color scheme for an organization based on its name
 * @param organizationName - The name of the organization
 * @returns An object with background and text color classes
 */
export function getOrganizationColors(organizationName: string): {
  bgClass: string;
  textClass: string;
  darkBgClass: string;
  darkTextClass: string;
} {
  if (!organizationName) {
    return {
      bgClass: "bg-gray-100",
      textClass: "text-gray-800",
      darkBgClass: "dark:bg-gray-900",
      darkTextClass: "dark:text-gray-200",
    };
  }

  // Create a simple hash from the organization name
  let hash = 0;
  for (let i = 0; i < organizationName.length; i++) {
    const char = organizationName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive number
  const positiveHash = Math.abs(hash);

  // Define color schemes
  const colorSchemes = [
    {
      bgClass: "bg-blue-100",
      textClass: "text-blue-800",
      darkBgClass: "dark:bg-blue-900",
      darkTextClass: "dark:text-blue-200",
    },
    {
      bgClass: "bg-green-100",
      textClass: "text-green-800",
      darkBgClass: "dark:bg-green-900",
      darkTextClass: "dark:text-green-200",
    },
    {
      bgClass: "bg-purple-100",
      textClass: "text-purple-800",
      darkBgClass: "dark:bg-purple-900",
      darkTextClass: "dark:text-purple-200",
    },
    {
      bgClass: "bg-red-100",
      textClass: "text-red-800",
      darkBgClass: "dark:bg-red-900",
      darkTextClass: "dark:text-red-200",
    },
    {
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-800",
      darkBgClass: "dark:bg-yellow-900",
      darkTextClass: "dark:text-yellow-200",
    },
    {
      bgClass: "bg-indigo-100",
      textClass: "text-indigo-800",
      darkBgClass: "dark:bg-indigo-900",
      darkTextClass: "dark:text-indigo-200",
    },
    {
      bgClass: "bg-pink-100",
      textClass: "text-pink-800",
      darkBgClass: "dark:bg-pink-900",
      darkTextClass: "dark:text-pink-200",
    },
    {
      bgClass: "bg-teal-100",
      textClass: "text-teal-800",
      darkBgClass: "dark:bg-teal-900",
      darkTextClass: "dark:text-teal-200",
    },
    {
      bgClass: "bg-orange-100",
      textClass: "text-orange-800",
      darkBgClass: "dark:bg-orange-900",
      darkTextClass: "dark:text-orange-200",
    },
    {
      bgClass: "bg-cyan-100",
      textClass: "text-cyan-800",
      darkBgClass: "dark:bg-cyan-900",
      darkTextClass: "dark:text-cyan-200",
    },
  ];

  // Select color scheme based on hash
  const colorIndex = positiveHash % colorSchemes.length;
  return colorSchemes[colorIndex];
}
