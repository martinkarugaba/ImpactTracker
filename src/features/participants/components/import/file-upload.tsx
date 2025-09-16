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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Proceed with file upload - batch processing will handle large files
    onFileUpload(event);
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
          <br />
          <span className="text-xs text-gray-500">
            Large files are automatically processed in batches for optimal
            performance
          </span>
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
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="text-xs text-gray-500">
        <h4 className="font-medium">Expected columns (Excel headers):</h4>
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
          <span>• Name</span>
          <span>• Gender</span>
          <span>• Marital Status</span>
          <span>• Phone</span>
          <span>• Date of Birth</span>
          <span>• Disabled</span>
          <span>• Subcounty</span>
          <span>• District</span>
          <span>• Parish</span>
          <span>• Village</span>
          <span>• Project</span>
          <span>• Education Level</span>
          <span>• Source of Income</span>
          <span>• Subscribed To VSLA</span>
          <span>• VSLA Name</span>
          <span>• Teen Mother</span>
          <span>• Owns Enterprise</span>
          <span>• Enterprise Name</span>
          <span>• Enterprise Sector</span>
          <span>• Enterprise Size</span>
          <span>• Ent. Youth Male</span>
          <span>• Ent. Youth Female</span>
          <span>• Ent. Adults</span>
          <span>• Has Vocational Skills</span>
          <span>• Vocational Skills Participations</span>
          <span>• Vocational Skills Completions</span>
          <span>• Vocational Skills Certifications</span>
          <span>• Has Soft Skills</span>
          <span>• Soft Skills Participations</span>
          <span>• Soft Skills Completions</span>
          <span>• Soft Skills Certifications</span>
          <span>• Has Business Skills</span>
          <span>• Nationality</span>
          <span>• Population Segment</span>
          <span>• Refugee</span>
          <span>• location</span>
          <span>• Employment status</span>
          <span>• Employment type</span>
          <span>• Employment sector</span>
          <span>• Active Student</span>
        </div>
        <div className="mt-2 text-xs text-amber-600">
          <strong>Note:</strong> Column names are flexible - the system will
          automatically map variations like "Name" or "Full Name", "Phone" or
          "Contact", etc.
        </div>
      </div>
    </div>
  );
}
