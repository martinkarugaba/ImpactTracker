import { format } from "date-fns";

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Format date in MMM dd format
 */
export const formatShortDate = (dateString: string) => {
  return format(new Date(dateString), "MMM dd");
};

/**
 * Format date in full format
 */
export const formatFullDate = (dateString: string | null) => {
  if (!dateString) return null;
  return format(new Date(dateString), "PPP");
};

/**
 * Calculate duration in days between two dates
 */
export const calculateDurationInDays = (startDate: string, endDate: string) => {
  return Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

/**
 * Check if a date is within the last X days
 */
export const isWithinLastDays = (dateString: string | null, days: number) => {
  if (!dateString) return false;
  return (
    new Date(dateString) > new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  );
};
