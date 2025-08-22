"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type ValidationError } from "./types";

interface ValidationErrorsProps {
  errors: ValidationError[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) {
    return null;
  }

  // Group errors by row
  const errorsByRow = errors.reduce(
    (acc, error) => {
      if (!acc[error.row]) {
        acc[error.row] = [];
      }
      acc[error.row].push(error);
      return acc;
    },
    {} as Record<number, ValidationError[]>
  );

  const maxRowsToShow = 10;
  const rowNumbers = Object.keys(errorsByRow)
    .map(Number)
    .sort((a, b) => a - b);
  const rowsToShow = rowNumbers.slice(0, maxRowsToShow);
  const hasMoreRows = rowNumbers.length > maxRowsToShow;

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Errors Found</AlertTitle>
        <AlertDescription>
          Found {errors.length} validation errors in {rowNumbers.length} rows.
          Please fix these errors in your Excel file and try again.
        </AlertDescription>
      </Alert>

      <div className="max-h-96 space-y-3 overflow-y-auto rounded-md border p-4">
        {rowsToShow.map(rowNumber => (
          <div key={rowNumber} className="border-l-4 border-red-400 pl-4">
            <h4 className="font-medium text-red-800">Row {rowNumber}</h4>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-red-700">
              {errorsByRow[rowNumber].map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{error.field}:</span>{" "}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {hasMoreRows && (
          <div className="pt-2 text-center text-sm text-gray-500">
            ... and {rowNumbers.length - maxRowsToShow} more rows with errors
          </div>
        )}
      </div>
    </div>
  );
}
