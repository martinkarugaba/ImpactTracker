"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SheetSelectorProps {
  sheets: string[];
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
  isLoading?: boolean;
}

export function SheetSelector({
  sheets,
  selectedSheet,
  onSheetSelect,
  isLoading = false,
}: SheetSelectorProps) {
  if (sheets.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="sheet-select">Select Sheet</Label>
      <Select
        value={selectedSheet}
        onValueChange={onSheetSelect}
        disabled={isLoading}
      >
        <SelectTrigger id="sheet-select">
          <SelectValue placeholder="Choose a sheet to import" />
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
  );
}
