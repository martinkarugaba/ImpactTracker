"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import { type ParticipantFormValues } from "../participant-form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useExcelImport } from "./hooks/use-excel-import";
import {
  useCountries,
  useDistricts,
} from "@/features/locations/hooks/use-locations-query";

interface ImportParticipantsProps {
  clusterId: string;
  onImportComplete?: () => void;
  trigger?: React.ReactNode;
  buttonText?: string;
  className?: string;
}

export function ImportParticipants({
  clusterId,
  onImportComplete,
  trigger,
  buttonText = "Import from Excel",
  className,
}: ImportParticipantsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<
    "upload" | "selectSheet" | "validate" | "preview" | "import"
  >("upload");

  // Global defaults for preview
  const [globalDefaults, setGlobalDefaults] = useState({
    countryId: "",
    districtId: "",
    subcountyId: "",
    parishId: "",
    villageId: "",
  });

  // Location queries
  const { data: countriesData } = useCountries();
  const { data: districtsData } = useDistricts({
    countryId: globalDefaults.countryId || undefined,
  });

  const {
    sheets,
    parsedData,
    validationErrors,
    isProcessing,
    isImporting,
    parseFile,
    validateData,
    importData,
    resetImport,
  } = useExcelImport(clusterId);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const result = await parseFile(selectedFile);

    if (result.sheets.length === 1) {
      setSelectedSheet(result.sheets[0]);
      setCurrentStep("validate");
    } else {
      setCurrentStep("selectSheet");
    }
  };

  const handleSheetSelect = (sheet: string) => {
    setSelectedSheet(sheet);
    setCurrentStep("validate");
  };

  const handleValidate = async () => {
    if (!file || !selectedSheet) return;

    const validationResult = await validateData(file, selectedSheet);

    if (validationResult.errors.length === 0) {
      setCurrentStep("preview");
    } else {
      toast.error(
        `Found ${validationResult.errors.length} validation errors. Please review.`
      );
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error("No data to import");
      return;
    }

    try {
      setCurrentStep("import");
      const result = await importData(parsedData as ParticipantFormValues[]);

      if (result.success) {
        toast.success(`Successfully imported ${result.imported} participants`);
        handleClose();
        onImportComplete?.();
      } else {
        toast.error(result.error || "Import failed");
        setCurrentStep("preview");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import participants");
      setCurrentStep("preview");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setSelectedSheet("");
    setCurrentStep("upload");
    resetImport();
  };

  const handleBack = () => {
    switch (currentStep) {
      case "selectSheet":
        setCurrentStep("upload");
        break;
      case "validate":
        if (sheets.length > 1) {
          setCurrentStep("selectSheet");
        } else {
          setCurrentStep("upload");
        }
        break;
      case "preview":
        setCurrentStep("validate");
        break;
      default:
        setCurrentStep("upload");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "upload":
        return !!file;
      case "selectSheet":
        return !!selectedSheet;
      case "validate":
        return true; // Can always try to validate
      case "preview":
        return (
          parsedData && parsedData.length > 0 && validationErrors.length === 0
        );
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "upload":
        return "Upload Excel File";
      case "selectSheet":
        return "Select Worksheet";
      case "validate":
        return "Validate Data";
      case "preview":
        return "Preview & Import";
      case "import":
        return "Importing...";
      default:
        return "Import Participants";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "upload":
        return "Select an Excel file containing participant data";
      case "selectSheet":
        return "Choose which worksheet contains the participant data";
      case "validate":
        return "Checking data format and required fields";
      case "preview":
        return "Review the data before importing";
      case "import":
        return "Processing import, please wait...";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Step */}
          {currentStep === "upload" && (
            <div className="space-y-4">
              <div className="border-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={e => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      handleFileSelect(selectedFile);
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center gap-2"
                >
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      Click to upload or drag and drop an Excel file
                    </p>
                    <p className="text-muted-foreground text-xs">
                      .xlsx or .xls files only
                    </p>
                  </div>
                </label>
              </div>
              {file && (
                <p className="text-muted-foreground text-sm">
                  Selected: {file.name}
                </p>
              )}
            </div>
          )}

          {/* Sheet Selection */}
          {currentStep === "selectSheet" && (
            <div className="space-y-4">
              <Label>Select Worksheet</Label>
              <Select value={selectedSheet} onValueChange={handleSheetSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a worksheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map(sheet => (
                    <SelectItem key={sheet} value={sheet}>
                      {sheet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Validation Step */}
          {currentStep === "validate" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Validating data from sheet: <strong>{selectedSheet}</strong>
                </p>
                {isProcessing && (
                  <p className="mt-2 text-sm text-blue-600">
                    Processing file...
                  </p>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-destructive font-medium">
                    Validation Errors
                  </h4>
                  <div className="max-h-40 overflow-y-auto rounded border">
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="border-b p-2 text-sm">
                        <span className="font-medium">Row {error.row}:</span>{" "}
                        {error.message}
                      </div>
                    ))}
                    {validationErrors.length > 10 && (
                      <div className="text-muted-foreground p-2 text-xs">
                        ... and {validationErrors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {currentStep === "preview" && parsedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Data Preview</h3>
                <div className="text-muted-foreground text-sm">
                  {parsedData.length} participants ready to import
                </div>
              </div>

              {/* Global defaults */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label>Default Country</Label>
                  <Select
                    value={globalDefaults.countryId}
                    onValueChange={value =>
                      setGlobalDefaults({
                        ...globalDefaults,
                        countryId: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesData?.data?.data?.map(country => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default District</Label>
                  <Select
                    value={globalDefaults.districtId}
                    onValueChange={value =>
                      setGlobalDefaults({
                        ...globalDefaults,
                        districtId: value,
                      })
                    }
                    disabled={!globalDefaults.countryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsData?.data?.data?.map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data table */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Sub County</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((participant, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {participant.firstName} {participant.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.sex}</Badge>
                        </TableCell>
                        <TableCell>{participant.age}</TableCell>
                        <TableCell>{participant.contact}</TableCell>
                        <TableCell>{participant.subCounty || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 5 && (
                  <div className="text-muted-foreground border-t p-2 text-center text-sm">
                    ... and {parsedData.length - 5} more participants
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Step */}
          {currentStep === "import" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-muted-foreground text-sm">
                Importing participants...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between border-t pt-4">
            <div>
              {currentStep !== "upload" && currentStep !== "import" && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              {currentStep === "validate" && (
                <Button onClick={handleValidate} disabled={isProcessing}>
                  {isProcessing ? "Validating..." : "Validate"}
                </Button>
              )}

              {currentStep === "preview" && (
                <Button
                  onClick={handleImport}
                  disabled={!canProceed() || isImporting}
                >
                  {isImporting
                    ? "Importing..."
                    : `Import ${parsedData?.length || 0} Participants`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
