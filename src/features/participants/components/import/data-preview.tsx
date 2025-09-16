"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { type ParticipantFormValues } from "../participant-form";

interface DataPreviewProps {
  data: ParticipantFormValues[];
  projects: { id: string; name: string }[];
  countryOptions: { value: string; label: string }[];
  districtOptions: { value: string; label: string }[];
  subCountyOptions: { value: string; label: string }[];
  selectedProject: string;
  selectedCountry: string;
  selectedDistrict: string;
  selectedSubCounty: string;
  onProjectSelect: (value: string) => void;
  onCountrySelect: (value: string) => void;
  onDistrictSelect: (value: string) => void;
  onSubCountySelect: (value: string) => void;
  onSearchCountry: (searchTerm: string) => void;
  onSearchDistrict: (searchTerm: string) => void;
  onSearchSubCounty: (searchTerm: string) => void;
  isLoadingCountries?: boolean;
  isLoadingDistricts?: boolean;
  isLoadingSubCounties?: boolean;
}

export function DataPreview({
  data,
  projects,
  countryOptions,
  districtOptions,
  subCountyOptions,
  selectedProject,
  selectedCountry,
  selectedDistrict,
  selectedSubCounty,
  onProjectSelect,
  onCountrySelect,
  onDistrictSelect,
  onSubCountySelect,
  isLoadingCountries = false,
  isLoadingDistricts = false,
  isLoadingSubCounties = false,
}: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  // Check if data has these fields populated
  const hasProjectInData = data.some(p => p.project_id);
  const hasCountryInData = data.some(p => p.country);
  const hasDistrictInData = data.some(p => p.district);
  const hasSubCountyInData = data.some(p => p.subCounty);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Data Preview</h3>
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{endIndex} of {data.length} participants
          </p>
        </div>
        <Badge variant="secondary">{data.length} valid records</Badge>
      </div>

      {/* Global Selection Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="project-select">
            Default Project{" "}
            {!hasProjectInData && <span className="text-red-500">*</span>}
          </Label>
          <Select value={selectedProject} onValueChange={onProjectSelect}>
            <SelectTrigger id="project-select">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasProjectInData && (
            <p className="mt-1 text-xs text-gray-500">
              Will be applied to all participants
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="country-select">
            Default Country{" "}
            {!hasCountryInData && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedCountry}
            onValueChange={onCountrySelect}
            disabled={isLoadingCountries}
          >
            <SelectTrigger id="country-select">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasCountryInData && (
            <p className="mt-1 text-xs text-gray-500">
              Will be applied to all participants
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="district-select">
            Default District{" "}
            {!hasDistrictInData && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedDistrict}
            onValueChange={onDistrictSelect}
            disabled={isLoadingDistricts || !selectedCountry}
          >
            <SelectTrigger id="district-select">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districtOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasDistrictInData && (
            <p className="mt-1 text-xs text-gray-500">
              Will be applied to all participants
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="subcounty-select">Default Sub County</Label>
          <Select
            value={selectedSubCounty}
            onValueChange={onSubCountySelect}
            disabled={isLoadingSubCounties || !selectedDistrict}
          >
            <SelectTrigger id="subcounty-select">
              <SelectValue placeholder="Select sub county" />
            </SelectTrigger>
            <SelectContent>
              {subCountyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasSubCountyInData && (
            <p className="mt-1 text-xs text-gray-500">
              Will be applied to all participants
            </p>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Marital Status</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Disabled</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Education Level</TableHead>
              <TableHead>Source of Income</TableHead>
              <TableHead>VSLA</TableHead>
              <TableHead>Teen Mother</TableHead>
              <TableHead>Enterprise</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Population Segment</TableHead>
              <TableHead>Refugee</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead>Active Student</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((participant, index) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">
                  {participant.firstName} {participant.lastName}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{participant.sex}</span>
                </TableCell>
                <TableCell>
                  <span className="capitalize">
                    {participant.maritalStatus || "—"}
                  </span>
                </TableCell>
                <TableCell>{participant.contact || "—"}</TableCell>
                <TableCell>
                  {participant.dateOfBirth ? (
                    <span className="text-sm">
                      {new Date(participant.dateOfBirth).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>{participant.age || "—"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      participant.isPWD === "yes"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {participant.isPWD === "yes" ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{participant.district}</div>
                    <div className="text-gray-500">{participant.subCounty}</div>
                    <div className="text-xs text-gray-400">
                      {participant.parish}, {participant.village}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500">
                    {participant.project_id ? "Mapped" : "Default"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">
                    {participant.educationLevel || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">
                    {participant.sourceOfIncome || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        participant.isSubscribedToVSLA === "yes"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {participant.isSubscribedToVSLA === "yes" ? "Yes" : "No"}
                    </div>
                    {participant.vslaName && (
                      <div className="mt-1 text-xs text-gray-500">
                        {participant.vslaName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      participant.isTeenMother === "yes"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {participant.isTeenMother === "yes" ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        participant.ownsEnterprise === "yes"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {participant.ownsEnterprise === "yes" ? "Yes" : "No"}
                    </div>
                    {participant.enterpriseName && (
                      <div className="mt-1 text-xs text-gray-500">
                        {participant.enterpriseName}
                      </div>
                    )}
                    {participant.enterpriseSector && (
                      <div className="text-xs text-gray-400 capitalize">
                        {participant.enterpriseSector}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{participant.nationality}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">
                    {participant.populationSegment || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      participant.isRefugee === "yes"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {participant.isRefugee === "yes" ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="capitalize">
                      {participant.employmentStatus}
                    </div>
                    {participant.employmentType && (
                      <div className="text-xs text-gray-500 capitalize">
                        {participant.employmentType}
                      </div>
                    )}
                    {participant.employmentSector && (
                      <div className="text-xs text-gray-400 capitalize">
                        {participant.employmentSector}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      participant.isActiveStudent === "yes"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {participant.isActiveStudent === "yes" ? "Yes" : "No"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
