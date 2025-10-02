"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Download, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";

export interface ExcelImportConfig<T> {
  // Feature-specific settings
  featureName: string; // e.g., "VSLA", "Participant", "Activity"
  templateFileName: string; // e.g., "vslas_import_template.xlsx"

  // Column mapping function - converts raw Excel row to typed data
  mapColumns: (row: Record<string, unknown>) => Partial<T>;

  // Validation function - returns error message or null if valid
  validateRow: (row: Partial<T>, rowNum: number) => string[];

  // Import function - handles the actual import
  importData: (data: T[]) => Promise<{
    success: boolean;
    imported?: number;
    errors?: string[];
    error?: string;
  }>;

  // Template generation function
  generateTemplate: () => unknown[][];
}

interface ExcelImportDialogProps<T> {
  config: ExcelImportConfig<T>;
  onImportComplete?: () => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function ExcelImportDialog<T>({
  config,
  onImportComplete,
  trigger,
  disabled = false,
}: ExcelImportDialogProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<T[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // For now, read first sheet (can be enhanced to support sheet selection)
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      // Map columns and validate data
      const errors: string[] = [];
      const validData: T[] = [];

      rawData.forEach((rawRow, index) => {
        const rowNum = index + 2; // Excel row number (header is row 1)
        const mappedRow = config.mapColumns(rawRow as Record<string, unknown>);

        // Validate the row
        const rowErrors = config.validateRow(mappedRow, rowNum);
        errors.push(...rowErrors);

        // If no errors for this row, add to valid data
        if (rowErrors.length === 0) {
          validData.push(mappedRow as T);
        }
      });

      setValidationErrors(errors);
      setImportData(validData);

      if (errors.length > 0) {
        toast.error(`Found ${errors.length} validation error(s)`);
      } else {
        toast.success(`Parsed ${validData.length} record(s) successfully`);
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file");
      setValidationErrors([
        "Failed to parse Excel file. Please check the format.",
      ]);
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setIsImporting(true);
    try {
      const result = await config.importData(importData);

      if (result.success) {
        toast.success(
          `Successfully imported ${result.imported} ${config.featureName.toLowerCase()}(s)`
        );
        if (result.errors && result.errors.length > 0) {
          toast.error(
            `Failed to import ${result.errors.length} ${config.featureName.toLowerCase()}(s)`
          );
        }
        setIsOpen(false);
        setFile(null);
        setImportData([]);
        setValidationErrors([]);
        onImportComplete?.();
      } else {
        toast.error(
          result.error ||
            `Failed to import ${config.featureName.toLowerCase()}s`
        );
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(`Failed to import ${config.featureName.toLowerCase()}s`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    try {
      const templateData = config.generateTemplate();
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, config.featureName);
      XLSX.writeFile(wb, config.templateFileName);
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Failed to generate template");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setImportData([]);
    setValidationErrors([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" disabled={disabled}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {config.featureName}s from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import {config.featureName.toLowerCase()}s.
            Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Download Template</p>
              <p className="text-muted-foreground text-sm">
                Get the Excel template with the correct format
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="file-upload" className="block text-sm font-medium">
              Upload Excel File
            </label>
            <div className="flex gap-2">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
              />
              {file && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setImportData([]);
                    setValidationErrors([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <h4 className="mb-2 font-semibold text-red-900 dark:text-red-100">
                Validation Errors ({validationErrors.length})
              </h4>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-red-800 dark:text-red-200">
                {validationErrors.slice(0, 10).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {validationErrors.length > 10 && (
                  <li className="font-medium">
                    ... and {validationErrors.length - 10} more errors
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Import Preview */}
          {file && importData.length > 0 && validationErrors.length === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <p className="font-semibold text-green-900 dark:text-green-100">
                Ready to import {importData.length}{" "}
                {config.featureName.toLowerCase()}(s)
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                !file ||
                importData.length === 0 ||
                validationErrors.length > 0 ||
                isImporting
              }
            >
              {isImporting
                ? "Importing..."
                : `Import ${importData.length} ${config.featureName}(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
