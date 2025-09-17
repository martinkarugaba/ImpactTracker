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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      {/* Comprehensive Data Preview with Tabs */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <h4 className="text-sm font-medium text-blue-900">
          📊 Enhanced Preview: Use tabs below to view all imported fields
        </h4>
        <p className="mt-1 text-xs text-blue-700">
          All {data.length} participants with complete field coverage across 5
          organized sections
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📋 Overview</TabsTrigger>
          <TabsTrigger value="personal">👤 Personal Info</TabsTrigger>
          <TabsTrigger value="location">📍 Location</TabsTrigger>
          <TabsTrigger value="enterprise">🏢 Enterprise</TabsTrigger>
          <TabsTrigger value="skills">🎓 Skills & VSLA</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Key Information */}
        <TabsContent value="overview" className="mt-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[80px]">Gender</TableHead>
                  <TableHead className="min-w-[100px]">Phone</TableHead>
                  <TableHead className="min-w-[120px]">Date of Birth</TableHead>
                  <TableHead className="min-w-[60px]">Age</TableHead>
                  <TableHead className="min-w-[80px]">Disabled</TableHead>
                  <TableHead className="min-w-[150px]">Location</TableHead>
                  <TableHead className="min-w-[120px]">Employment</TableHead>
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
                    <TableCell>{participant.contact || "—"}</TableCell>
                    <TableCell>
                      {participant.dateOfBirth ? (
                        <span className="text-sm">
                          {new Date(
                            participant.dateOfBirth
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{participant.age || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.isPWD === "yes" ? "secondary" : "outline"
                        }
                      >
                        {participant.isPWD === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {participant.district}
                        </div>
                        <div className="text-gray-500">
                          {participant.subCounty}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="capitalize">
                          {participant.employmentStatus}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {participant.employmentType || "—"}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="mt-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">
                    Marital Status
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    Education Level
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    Source of Income
                  </TableHead>
                  <TableHead className="min-w-[100px]">Nationality</TableHead>
                  <TableHead className="min-w-[140px]">
                    Population Segment
                  </TableHead>
                  <TableHead className="min-w-[80px]">Refugee</TableHead>
                  <TableHead className="min-w-[120px]">Teen Mother</TableHead>
                  <TableHead className="min-w-[120px]">
                    Active Student
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((participant, index) => (
                  <TableRow key={startIndex + index}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.maritalStatus || "—"}
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
                      <span className="text-sm">{participant.nationality}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.populationSegment || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.isRefugee === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.isRefugee === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.isTeenMother === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.isTeenMother === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.isActiveStudent === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.isActiveStudent === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="mt-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[100px]">District</TableHead>
                  <TableHead className="min-w-[120px]">Subcounty</TableHead>
                  <TableHead className="min-w-[100px]">Parish</TableHead>
                  <TableHead className="min-w-[100px]">Village</TableHead>
                  <TableHead className="min-w-[100px]">
                    Location Setting
                  </TableHead>
                  <TableHead className="min-w-[100px]">Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((participant, index) => (
                  <TableRow key={startIndex + index}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>{participant.district}</TableCell>
                    <TableCell>{participant.subCounty}</TableCell>
                    <TableCell>{participant.parish || "—"}</TableCell>
                    <TableCell>{participant.village || "—"}</TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.locationSetting || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {participant.project_id ? "Mapped" : "Default"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Enterprise Tab */}
        <TabsContent value="enterprise" className="mt-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">
                    Owns Enterprise
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    Enterprise Name
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    Enterprise Sector
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Enterprise Size
                  </TableHead>
                  <TableHead className="min-w-[100px]">Youth Male</TableHead>
                  <TableHead className="min-w-[110px]">Youth Female</TableHead>
                  <TableHead className="min-w-[80px]">Adults</TableHead>
                  <TableHead className="min-w-[120px]">
                    Employment Type
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    Employment Sector
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((participant, index) => (
                  <TableRow key={startIndex + index}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.ownsEnterprise === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.ownsEnterprise === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.enterpriseName || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.enterpriseSector || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.enterpriseSize || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.enterpriseYouthMale || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.enterpriseYouthFemale || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.enterpriseAdults || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.employmentType || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {participant.employmentSector || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Skills & VSLA Tab */}
        <TabsContent value="skills" className="mt-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[100px]">VSLA Member</TableHead>
                  <TableHead className="min-w-[120px]">VSLA Name</TableHead>
                  <TableHead className="min-w-[140px]">
                    Vocational Skills
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    Voc. Participations
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    Voc. Completions
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    Voc. Certifications
                  </TableHead>
                  <TableHead className="min-w-[100px]">Soft Skills</TableHead>
                  <TableHead className="min-w-[100px]">
                    Soft Participations
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    Soft Completions
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    Soft Certifications
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Business Skills
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((participant, index) => (
                  <TableRow key={startIndex + index}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.isSubscribedToVSLA === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.isSubscribedToVSLA === "yes"
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.vslaName || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.hasVocationalSkills === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.hasVocationalSkills === "yes"
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.vocationalSkillsParticipations || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.vocationalSkillsCompletions || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.vocationalSkillsCertifications || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.hasSoftSkills === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.hasSoftSkills === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.softSkillsParticipations || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.softSkillsCompletions || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.softSkillsCertifications || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.hasBusinessSkills === "yes"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {participant.hasBusinessSkills === "yes" ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

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
