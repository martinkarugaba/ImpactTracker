"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

export function FileUpload({
  onFileUpload,
  isLoading = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Upload Excel File
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Select an Excel file (.xlsx, .xls) with participant data
        </p>
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className="mt-4"
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Processing..." : "Choose File"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="hidden"
        />
      </div>

      <div className="text-xs text-gray-500">
        <h4 className="font-medium">Expected columns:</h4>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <span>• Name (or FirstName/LastName)</span>
          <span>• Sex/Gender</span>
          <span>• Age</span>
          <span>• Phone No./Contact</span>
          <span>• District</span>
          <span>• SubCounty</span>
          <span>• Parish</span>
          <span>• Village</span>
          <span>• Employment status</span>
          <span>• Skill of Interest</span>
        </div>
      </div>
    </div>
  );
}
