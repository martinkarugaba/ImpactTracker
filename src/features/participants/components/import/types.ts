import { type ParticipantFormValues } from "../participant-form";

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedData {
  data: ParticipantFormValues[];
  errors: ValidationError[];
  rawData: Record<string, unknown>[];
}

export interface ImportProgress {
  total: number;
  processed: number;
  errors: number;
  success: number;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: ValidationError[];
}
