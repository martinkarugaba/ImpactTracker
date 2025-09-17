"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type ParticipantFormValues } from "../components/participant-form";
import type {
  DuplicateMatch,
  DuplicateAnalysisResult,
} from "../components/import/duplicate-detection";

// Helper function to calculate string similarity
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  // Simple Levenshtein distance calculation
  const matrix = [];
  const len1 = s1.length;
  const len2 = s2.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);

  return Math.round(((maxLength - distance) / maxLength) * 100);
}

// Helper function to normalize phone numbers
function normalizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[\s\-\(\)]/g, "").replace(/^(\+?256|0)/, "");
}

// Helper function to calculate match score and reasons
function calculateMatch(
  importRow: ParticipantFormValues,
  existingParticipant: {
    id: string;
    firstName: string;
    lastName: string;
    contact: string | null;
    dateOfBirth: Date | null;
    district: string;
    subCounty: string;
    created_at: Date | null;
  }
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Name matching (weighted heavily)
  const firstNameSim = calculateSimilarity(
    importRow.firstName,
    existingParticipant.firstName
  );
  const lastNameSim = calculateSimilarity(
    importRow.lastName,
    existingParticipant.lastName
  );
  const nameSim = (firstNameSim + lastNameSim) / 2;

  if (nameSim >= 90) {
    score += 40;
    reasons.push("Name exact match");
  } else if (nameSim >= 70) {
    score += 25;
    reasons.push("Name similar");
  }

  // Phone number matching
  if (importRow.contact && existingParticipant.contact) {
    const normalizedImport = normalizePhone(importRow.contact);
    const normalizedExisting = normalizePhone(existingParticipant.contact);

    if (normalizedImport && normalizedExisting) {
      if (normalizedImport === normalizedExisting) {
        score += 30;
        reasons.push("Phone exact match");
      } else if (
        normalizedImport.includes(normalizedExisting) ||
        normalizedExisting.includes(normalizedImport)
      ) {
        score += 20;
        reasons.push("Phone partial match");
      }
    }
  }

  // Date of birth matching
  if (importRow.dateOfBirth && existingParticipant.dateOfBirth) {
    const importDate = new Date(importRow.dateOfBirth)
      .toISOString()
      .split("T")[0];
    const existingDate = new Date(existingParticipant.dateOfBirth)
      .toISOString()
      .split("T")[0];

    if (importDate === existingDate) {
      score += 20;
      reasons.push("Date of birth match");
    }
  }

  // Location matching
  if (importRow.district && existingParticipant.district) {
    const districtSim = calculateSimilarity(
      importRow.district,
      existingParticipant.district
    );
    if (districtSim >= 90) {
      score += 5;
      reasons.push("District match");

      // Subcounty matching (only if district matches)
      if (importRow.subCounty && existingParticipant.subCounty) {
        const subCountySim = calculateSimilarity(
          importRow.subCounty,
          existingParticipant.subCounty
        );
        if (subCountySim >= 90) {
          score += 5;
          reasons.push("Subcounty match");
        }
      }
    }
  }

  return { score: Math.min(score, 100), reasons };
}

export async function detectDuplicates(
  importData: ParticipantFormValues[],
  clusterId: string
): Promise<DuplicateAnalysisResult> {
  // For large datasets, automatically use the batched version
  if (importData.length > 100) {
    return detectDuplicatesBatched(importData, clusterId);
  }

  // Original smaller implementation for small datasets
  try {
    console.log(
      `Starting duplicate detection for ${importData.length} records in cluster ${clusterId}`
    );

    const existingParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        contact: participants.contact,
        dateOfBirth: participants.dateOfBirth,
        district: participants.district,
        subCounty: participants.subCounty,
        created_at: participants.created_at,
      })
      .from(participants)
      .where(eq(participants.cluster_id, clusterId));

    const exactDuplicates: DuplicateMatch[] = [];
    const potentialDuplicates: DuplicateMatch[] = [];
    const uniqueRecords: ParticipantFormValues[] = [];

    for (const importRow of importData) {
      let bestMatch: DuplicateMatch | null = null;
      let isExactDuplicate = false;

      for (const existing of existingParticipants) {
        const { score, reasons } = calculateMatch(importRow, existing);

        if (score >= 85) {
          isExactDuplicate = true;
          bestMatch = {
            importRow,
            existingParticipant: {
              id: existing.id,
              firstName: existing.firstName,
              lastName: existing.lastName,
              contact: existing.contact || "",
              dateOfBirth:
                existing.dateOfBirth?.toISOString().split("T")[0] || null,
              district: existing.district,
              subCounty: existing.subCounty,
              created_at:
                existing.created_at?.toISOString() || new Date().toISOString(),
            },
            matchScore: score,
            matchReasons: reasons,
          };
          break;
        } else if (score >= 60) {
          if (!bestMatch || score > bestMatch.matchScore) {
            bestMatch = {
              importRow,
              existingParticipant: {
                id: existing.id,
                firstName: existing.firstName,
                lastName: existing.lastName,
                contact: existing.contact || "",
                dateOfBirth:
                  existing.dateOfBirth?.toISOString().split("T")[0] || null,
                district: existing.district,
                subCounty: existing.subCounty,
                created_at:
                  existing.created_at?.toISOString() ||
                  new Date().toISOString(),
              },
              matchScore: score,
              matchReasons: reasons,
            };
          }
        }
      }

      if (isExactDuplicate && bestMatch) {
        exactDuplicates.push(bestMatch);
      } else if (bestMatch && bestMatch.matchScore >= 60) {
        potentialDuplicates.push(bestMatch);
      } else {
        uniqueRecords.push(importRow);
      }
    }

    return {
      exactDuplicates,
      potentialDuplicates,
      uniqueRecords,
      skippedCount: exactDuplicates.length,
    };
  } catch (error) {
    console.error("Error detecting duplicates:", error);
    return {
      exactDuplicates: [],
      potentialDuplicates: [],
      uniqueRecords: importData,
      skippedCount: 0,
    };
  }
}

export async function detectDuplicatesBatched(
  importData: ParticipantFormValues[],
  clusterId: string,
  onProgress?: (progress: {
    current: number;
    total: number;
    percentage: number;
  }) => void
): Promise<DuplicateAnalysisResult> {
  try {
    console.log(
      `Starting batched duplicate detection for ${importData.length} records`
    );

    const existingParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        contact: participants.contact,
        dateOfBirth: participants.dateOfBirth,
        district: participants.district,
        subCounty: participants.subCounty,
        created_at: participants.created_at,
      })
      .from(participants)
      .where(eq(participants.cluster_id, clusterId));

    const exactDuplicates: DuplicateMatch[] = [];
    const potentialDuplicates: DuplicateMatch[] = [];
    const uniqueRecords: ParticipantFormValues[] = [];

    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(importData.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, importData.length);
      const batch = importData.slice(start, end);

      onProgress?.({
        current: start,
        total: importData.length,
        percentage: Math.round((start / importData.length) * 100),
      });

      for (const importRow of batch) {
        let bestMatch: DuplicateMatch | null = null;
        let isExactDuplicate = false;

        for (const existing of existingParticipants) {
          const { score, reasons } = calculateMatch(importRow, existing);

          if (score >= 85) {
            isExactDuplicate = true;
            bestMatch = {
              importRow,
              existingParticipant: {
                id: existing.id,
                firstName: existing.firstName,
                lastName: existing.lastName,
                contact: existing.contact || "",
                dateOfBirth:
                  existing.dateOfBirth?.toISOString().split("T")[0] || null,
                district: existing.district,
                subCounty: existing.subCounty,
                created_at:
                  existing.created_at?.toISOString() ||
                  new Date().toISOString(),
              },
              matchScore: score,
              matchReasons: reasons,
            };
            break;
          } else if (score >= 60) {
            if (!bestMatch || score > bestMatch.matchScore) {
              bestMatch = {
                importRow,
                existingParticipant: {
                  id: existing.id,
                  firstName: existing.firstName,
                  lastName: existing.lastName,
                  contact: existing.contact || "",
                  dateOfBirth:
                    existing.dateOfBirth?.toISOString().split("T")[0] || null,
                  district: existing.district,
                  subCounty: existing.subCounty,
                  created_at:
                    existing.created_at?.toISOString() ||
                    new Date().toISOString(),
                },
                matchScore: score,
                matchReasons: reasons,
              };
            }
          }
        }

        if (isExactDuplicate && bestMatch) {
          exactDuplicates.push(bestMatch);
        } else if (bestMatch && bestMatch.matchScore >= 60) {
          potentialDuplicates.push(bestMatch);
        } else {
          uniqueRecords.push(importRow);
        }
      }

      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    onProgress?.({
      current: importData.length,
      total: importData.length,
      percentage: 100,
    });

    return {
      exactDuplicates,
      potentialDuplicates,
      uniqueRecords,
      skippedCount: exactDuplicates.length,
    };
  } catch (error) {
    console.error("Error in batched duplicate detection:", error);
    return {
      exactDuplicates: [],
      potentialDuplicates: [],
      uniqueRecords: importData,
      skippedCount: 0,
    };
  }
}
