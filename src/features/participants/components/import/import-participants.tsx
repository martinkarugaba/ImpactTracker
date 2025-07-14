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
import { FileUpload } from "./file-upload";
import { SheetSelector } from "./sheet-selector";
import { ValidationErrors } from "./validation-errors";
import { DataPreview } from "./data-preview";
import { useExcelImport } from "./hooks/use-excel-import";
import {
  useLocationSearch,
  useDistrictSearch,
  useSubCountySearch,
} from "@/features/locations/hooks/use-locations-query";

interface ImportParticipantsProps {
  onImport: (data: ParticipantFormValues[]) => Promise<void>;
  clusterId: string;
  projects: { id: string; name: string }[];
}

export function ImportParticipants({
  onImport,
  clusterId,
  projects = [], // Default to empty array
}: ImportParticipantsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>("");

  // Search states
  const [countrySearch, setCountrySearch] = useState<string>("");
  const [districtSearch, setDistrictSearch] = useState<string>("");
  const [subCountySearch, setSubCountySearch] = useState<string>("");

  // Get filtered locations from the database based on search terms
  const { data: countriesData, isLoading: isLoadingCountries } =
    useLocationSearch(countrySearch);

  const { data: districtsData, isLoading: isLoadingDistricts } =
    useDistrictSearch({
      countryId: selectedCountry,
      searchTerm: districtSearch,
    });

  const { data: subCountiesData, isLoading: isLoadingSubCounties } =
    useSubCountySearch({
      districtId: selectedDistrict,
      searchTerm: subCountySearch,
    });

  const {
    isLoading,
    parsedData,
    availableSheets,
    selectedSheet,
    handleFileUpload,
    handleSheetSelect,
    resetImport,
  } = useExcelImport(clusterId);

  // Handlers for filtering options
  const handleProjectSelect = (value: string) => {
    setSelectedProject(value);
  };

  const handleCountrySelect = (value: string) => {
    setSelectedCountry(value);
    // Reset district and subcounty selections when country changes
    setSelectedDistrict("");
    setSelectedSubCounty("");
    // Reset search terms
    setDistrictSearch("");
    setSubCountySearch("");
  };

  const handleDistrictSelect = (value: string) => {
    setSelectedDistrict(value);
    // Clear subcounty when district changes
    setSelectedSubCounty("");
    // Reset subcounty search
    setSubCountySearch("");
  };

  const handleSubCountySelect = (value: string) => {
    setSelectedSubCounty(value);
  };

  const handleCountrySearch = (searchTerm: string) => {
    setCountrySearch(searchTerm);
  };

  const handleDistrictSearch = (searchTerm: string) => {
    setDistrictSearch(searchTerm);
  };

  const handleSubCountySearch = (searchTerm: string) => {
    setSubCountySearch(searchTerm);
  };

  const handleImport = async () => {
    if (!parsedData?.data || parsedData.data.length === 0) {
      toast.error("No data to import");
      return;
    }

    // Make sure required IDs are set
    if (selectedProject && !parsedData.data[0].project_id) {
      toast.error("Please select a project");
      return;
    }

    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    if (!selectedDistrict) {
      toast.error("Please select a district");
      return;
    }

    const toastId = toast.loading(
      `Importing ${parsedData.data.length} participants...`
    );
    try {
      // Apply the selected project, country, district, and subcounty to all participants
      const updatedData = parsedData.data.map(participant => ({
        ...participant,
        project_id: selectedProject || participant.project_id,
        country: selectedCountry, // Use the selected country UUID
        district: selectedDistrict, // Use the selected district UUID
        subCounty: selectedSubCounty || participant.subCounty, // Use the selected subcounty UUID if available
      }));

      await onImport(updatedData);
      toast.success(
        `Successfully imported ${parsedData.data.length} participants`,
        {
          id: toastId,
        }
      );
      setIsOpen(false);
      resetImport();
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error
          ? `Import failed: ${error.message}`
          : "Failed to import participants",
        { id: toastId }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[1400px] max-w-[95vw] overflow-y-auto">
        <DialogHeader className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Import Participants</DialogTitle>
              <DialogDescription>
                Import participants from an Excel file
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {parsedData && !parsedData.errors?.length && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProject("");
                      setSelectedCountry("");
                      setSelectedDistrict("");
                      setSelectedSubCounty("");
                      resetImport();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={isLoading}>
                    Import
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {!parsedData ? (
          <div className="space-y-4">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            {availableSheets && availableSheets.length > 0 && (
              <SheetSelector
                sheets={availableSheets}
                selectedSheet={selectedSheet}
                onSheetSelect={handleSheetSelect}
                isLoading={isLoading}
              />
            )}
          </div>
        ) : parsedData.errors && parsedData.errors.length > 0 ? (
          <ValidationErrors errors={parsedData.errors} />
        ) : (
          <div className="space-y-4">
            <DataPreview
              data={parsedData.data}
              projects={projects}
              countryOptions={
                countriesData?.data?.data?.map(
                  (country: { id: string; name: string; code: string }) => ({
                    value: country.id,
                    label: `${country.name} (${country.code})`,
                  })
                ) || []
              }
              selectedCountry={selectedCountry}
              selectedProject={selectedProject}
              selectedDistrict={selectedDistrict}
              selectedSubCounty={selectedSubCounty}
              onCountrySelect={handleCountrySelect}
              onProjectSelect={handleProjectSelect}
              onDistrictSelect={handleDistrictSelect}
              onSubCountySelect={handleSubCountySelect}
              onSearchCountry={handleCountrySearch}
              onSearchDistrict={handleDistrictSearch}
              onSearchSubCounty={handleSubCountySearch}
              districtOptions={
                districtsData?.data?.data?.map(
                  (district: { id: string; name: string }) => ({
                    value: district.id,
                    label: district.name,
                  })
                ) || []
              }
              subCountyOptions={
                subCountiesData?.data?.data?.map(
                  (subCounty: { id: string; name: string }) => ({
                    value: subCounty.id,
                    label: subCounty.name,
                  })
                ) || []
              }
              isLoadingCountries={isLoadingCountries}
              isLoadingDistricts={isLoadingDistricts}
              isLoadingSubCounties={isLoadingSubCounties}
            />
            {/* Action buttons moved to header */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
