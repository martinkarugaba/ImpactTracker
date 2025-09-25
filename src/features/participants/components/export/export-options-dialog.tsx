"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  exportDialogAtom,
  exportFormatAtom,
  exportOptionsAtom,
  type ExportOptions,
} from "../../atoms/export-atoms";

interface ExportOptionsDialogProps {
  onExport: (format: "csv" | "excel", options: ExportOptions) => void;
  participantCount: number;
}

export function ExportOptionsDialog({
  onExport,
  participantCount,
}: ExportOptionsDialogProps) {
  const [isOpen, setIsOpen] = useAtom(exportDialogAtom);
  const [format, setFormat] = useAtom(exportFormatAtom);
  const [exportOptions, setExportOptions] = useAtom(exportOptionsAtom);
  const [tempOptions, setTempOptions] = useState<ExportOptions>(exportOptions);

  const handleExport = () => {
    // Save the options for future use
    setExportOptions(tempOptions);

    // Trigger the export
    onExport(format, tempOptions);

    // Close dialog
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset temp options to saved options
    setTempOptions(exportOptions);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Participants
          </DialogTitle>
          <DialogDescription>
            Configure your export preferences. Exporting {participantCount}{" "}
            participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={value => setFormat(value as "csv" | "excel")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="csv" id="csv" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <Label htmlFor="csv" className="cursor-pointer">
                    CSV Format
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="excel" id="excel" />
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <Label htmlFor="excel" className="cursor-pointer">
                    Excel Format
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Name Format Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label className="text-base font-medium">
                Name Format Options
              </Label>
            </div>

            <RadioGroup
              value={tempOptions.nameFormat}
              onValueChange={value =>
                setTempOptions(prev => ({
                  ...prev,
                  nameFormat: value as "combined" | "separate",
                }))
              }
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem
                    value="combined"
                    id="combined"
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="combined"
                      className="cursor-pointer font-medium"
                    >
                      Combined Name (Recommended)
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Single "Name" column containing full names (e.g., "John
                      Doe")
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem
                    value="separate"
                    id="separate"
                    className="mt-0.5"
                  />
                  <div className="space-y-2">
                    <Label
                      htmlFor="separate"
                      className="cursor-pointer font-medium"
                    >
                      Separate Name Columns
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Separate "First Name" and "Last Name" columns
                    </p>

                    {/* Additional option for separate format */}
                    {tempOptions.nameFormat === "separate" && (
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="includeFullName"
                          checked={tempOptions.includeFullName}
                          onCheckedChange={checked =>
                            setTempOptions(prev => ({
                              ...prev,
                              includeFullName: checked === true,
                            }))
                          }
                        />
                        <Label
                          htmlFor="includeFullName"
                          className="cursor-pointer text-sm"
                        >
                          Also include a combined "Full Name" column
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
