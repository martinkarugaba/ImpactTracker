"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Download, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type ImportStep = "upload" | "preview" | "importing";

export function ExcelImportDialog<T>({
  config,
  onImportComplete,
  trigger,
  disabled = false,
}: ExcelImportDialogProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<T[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

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
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      setWorkbook(wb);

      // Check if workbook has multiple sheets
      if (wb.SheetNames.length > 1) {
        setAvailableSheets(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
        // Parse the first sheet immediately
        parseSheet(wb, wb.SheetNames[0]);
        toast.success(
          `Excel file has ${wb.SheetNames.length} sheets. Loaded "${wb.SheetNames[0]}". You can select a different sheet if needed.`
        );
      } else {
        // Single sheet - parse immediately
        setAvailableSheets(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
        parseSheet(wb, wb.SheetNames[0]);
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file");
      setValidationErrors([
        "Failed to parse Excel file. Please check the format.",
      ]);
    }
  };

  const parseSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    try {
      const worksheet = wb.Sheets[sheetName];
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
      console.error("Error parsing sheet:", error);
      toast.error("Failed to parse sheet");
      setValidationErrors(["Failed to parse sheet. Please check the format."]);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbook) {
      parseSheet(workbook, sheetName);
    }
  };

  const handleContinueToPreview = () => {
    if (importData.length > 0 && validationErrors.length === 0) {
      setCurrentStep("preview");
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setCurrentStep("importing");

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
        handleClose();
        onImportComplete?.();
      } else {
        toast.error(
          result.error ||
            `Failed to import ${config.featureName.toLowerCase()}s`
        );
        setCurrentStep("preview");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(`Failed to import ${config.featureName.toLowerCase()}s`);
      setCurrentStep("preview");
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
    setCurrentStep("upload");
    setFile(null);
    setImportData([]);
    setValidationErrors([]);
    setAvailableSheets([]);
    setSelectedSheet("");
    setWorkbook(null);
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case "upload":
        return `Import ${config.featureName}s from Excel`;
      case "preview":
        return `Preview ${config.featureName} Data`;
      case "importing":
        return `Importing ${config.featureName}s...`;
    }
  };

  const getDialogDescription = () => {
    switch (currentStep) {
      case "upload":
        return `Upload an Excel file to import ${config.featureName.toLowerCase()}s. Download the template to see the required format.`;
      case "preview":
        return `Review the parsed data before importing ${importData.length} ${config.featureName.toLowerCase()}(s).`;
      case "importing":
        return `Please wait while we import your ${config.featureName.toLowerCase()}s...`;
    }
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
      <DialogContent
        className={currentStep === "preview" ? "max-w-7xl" : "max-w-2xl"}
      >
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Step */}
          {currentStep === "upload" && (
            <>
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
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium"
                >
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
                        setAvailableSheets([]);
                        setSelectedSheet("");
                        setWorkbook(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sheet Selection */}
              {availableSheets.length > 1 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Select Sheet
                  </label>
                  <Select
                    value={selectedSheet}
                    onValueChange={handleSheetChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a sheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSheets.map(sheet => (
                        <SelectItem key={sheet} value={sheet}>
                          {sheet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-sm">
                    This file contains {availableSheets.length} sheets. Select
                    the sheet you want to import.
                  </p>
                </div>
              )}

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

              {/* Ready to Continue */}
              {file &&
                importData.length > 0 &&
                validationErrors.length === 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Ready to preview {importData.length}{" "}
                      {config.featureName.toLowerCase()}(s)
                    </p>
                  </div>
                )}

              {/* Upload Step Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleContinueToPreview}
                  disabled={
                    !file ||
                    importData.length === 0 ||
                    validationErrors.length > 0
                  }
                >
                  Continue to Preview
                </Button>
              </div>
            </>
          )}

          {/* Preview Step */}
          {currentStep === "preview" && (
            <>
              <div className="space-y-4">
                {/* Preview Stats */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {importData.length} {config.featureName.toLowerCase()}(s)
                    ready to import
                  </p>
                </div>

                {/* Preview Table */}
                <div className="rounded-lg border">
                  <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0 z-10">
                        <tr>
                          <th className="border-b px-4 py-2 text-left font-medium">
                            #
                          </th>
                          {importData.length > 0 &&
                            Object.keys(importData[0] as object).map(key => (
                              <th
                                key={key}
                                className="border-b px-4 py-2 text-left font-medium"
                              >
                                {key
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, l => l.toUpperCase())}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 100).map((row, index) => (
                          <tr
                            key={index}
                            className="hover:bg-muted/50 border-b last:border-0"
                          >
                            <td className="text-muted-foreground px-4 py-2">
                              {index + 1}
                            </td>
                            {Object.entries(row as object).map(
                              ([key, value]) => (
                                <td key={key} className="px-4 py-2">
                                  <div className="max-w-xs truncate">
                                    {value !== null && value !== undefined
                                      ? String(value)
                                      : "-"}
                                  </div>
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importData.length > 100 && (
                    <div className="text-muted-foreground bg-muted border-t px-4 py-2 text-center text-sm">
                      Showing first 100 of {importData.length} records
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Step Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBackToUpload}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport}>
                    Import {importData.length} {config.featureName}(s)
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Importing Step */}
          {currentStep === "importing" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="text-muted-foreground text-sm">
                    Importing {importData.length}{" "}
                    {config.featureName.toLowerCase()}(s)...
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    This may take a few moments
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
