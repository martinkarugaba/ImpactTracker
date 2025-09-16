/**
 * Utility functions for participant import operations
 * Provides file size validation and performance optimization helpers
 */

// File size constants (in bytes)
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  RECOMMENDED_BATCH_SIZE: 1000, // participants per import
  MAX_PARTICIPANTS: 5000, // absolute limit
} as const;

/**
 * Format file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate file size against limits
 */
export function validateFileSize(file: File): {
  isValid: boolean;
  error?: string;
  sizeFormatted: string;
} {
  const sizeFormatted = formatFileSize(file.size);

  if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size (${sizeFormatted}) exceeds the ${formatFileSize(FILE_SIZE_LIMITS.MAX_FILE_SIZE)} limit. Please use a smaller file or split your data into multiple files.`,
      sizeFormatted,
    };
  }

  return {
    isValid: true,
    sizeFormatted,
  };
}

/**
 * Estimate number of participants that can fit in a file size
 */
export function estimateParticipantCount(fileSizeBytes: number): {
  min: number;
  max: number;
} {
  // Rough estimates based on typical Excel participant data
  // Conservative: ~400 bytes per participant (simple data)
  // Expansive: ~800 bytes per participant (complex data with many fields)
  const conservativeEstimate = Math.floor(fileSizeBytes / 800);
  const optimisticEstimate = Math.floor(fileSizeBytes / 400);

  return {
    min: conservativeEstimate,
    max: optimisticEstimate,
  };
}

/**
 * Performance recommendations based on data size
 */
export function getPerformanceRecommendations(participantCount: number): {
  level: "good" | "warning" | "critical";
  message: string;
  suggestions: string[];
} {
  if (participantCount <= 1000) {
    return {
      level: "good",
      message: "Optimal size for fast processing",
      suggestions: [
        "Import should complete quickly",
        "No special considerations needed",
      ],
    };
  }

  if (participantCount <= 3000) {
    return {
      level: "warning",
      message: "Large dataset - processing may take several minutes",
      suggestions: [
        "Import will be processed in batches",
        "Don't close the browser window during import",
        "Consider splitting into smaller files for faster processing",
      ],
    };
  }

  return {
    level: "critical",
    message: "Very large dataset - may cause timeout or performance issues",
    suggestions: [
      "Strongly recommend splitting into files of 1,000-2,000 participants each",
      "Import may take 10+ minutes and could timeout",
      "Consider using database bulk import tools for datasets this large",
    ],
  };
}
