"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Download,
  Upload,
  Search,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { ParticipantsDataTable } from "../participants-data-table";
import {
  type Participant,
  type ParticipantFilters as ParticipantFiltersType,
  type ParticipantsResponse,
} from "../../types/types";
import toast from "react-hot-toast";
import { ParticipantFilters } from "../filters";
import { OrganizationAssignmentButton } from "../actions/organization-assignment-button";

interface ParticipantsTabProps {
  participants: Participant[];
  clusterId: string;
  pagination: {
    page: number;
    pageSize: number;
  };
  participantsData: unknown;
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{ id: string; name: string; acronym: string }>;
  clusters: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  filterOptions: {
    districts: Array<{ id: string; name: string }>;
    subCounties: Array<{ id: string; name: string }>;
    enterprises: Array<{ id: string; name: string }>;
  };
  searchValue: string;
  onSearchChange: (search: string) => void;
  isParticipantsLoading: boolean;
  locationNamesLoading: boolean;
  onPaginationChange: (page: number, pageSize: number) => void;
  onPageChange: (page: number) => void;
  onAddParticipant: () => void;
  onEditParticipant: (data: unknown, id: string) => void;
  onDeleteParticipant: (id: string) => void;
  onViewParticipant?: (participant: Participant) => void;
  onExportData: () => void;
  onImport: (data: unknown[]) => void;
  setIsImportDialogOpen: (open: boolean) => void;
}

export function ParticipantsTab({
  participants,
  clusterId,
  pagination,
  participantsData,
  filters,
  onFiltersChange,
  projects,
  clusters,
  organizations,
  filterOptions,
  searchValue,
  onSearchChange,
  isParticipantsLoading,
  locationNamesLoading,
  onPaginationChange,
  onPageChange,
  onAddParticipant,
  onEditParticipant,
  onDeleteParticipant,
  onViewParticipant,
  onExportData: _onExportData,
  onImport: _onImport,
  setIsImportDialogOpen,
}: ParticipantsTabProps) {
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    fullName: true,
    sex: true,
    age: true,
    district: true,
    subCounty: false,
    country: false,
    organization: true,
    project: true,
    designation: false,
    enterprise: false,
    contact: false,
  });

  // Available columns for toggle - matching actual column IDs
  const availableColumns = [
    { id: "fullName", label: "Name" },
    { id: "sex", label: "Gender" },
    { id: "age", label: "Age" },
    { id: "district", label: "District" },
    { id: "subCounty", label: "Sub County" },
    { id: "country", label: "Country" },
    { id: "organization", label: "Organization" },
    { id: "project", label: "Project" },
    { id: "designation", label: "Designation" },
    { id: "enterprise", label: "Enterprise" },
    { id: "contact", label: "Contact" },
  ];

  const handleExport = () => {
    // Export functionality deactivated - coming soon modal will be shown
    console.log("Export functionality coming soon!");
  };

  return (
    <TabsContent value="participants" className="mt-6">
      <div className="space-y-6">
        {/* Enhanced Header Section with Better Visual Hierarchy */}
        <div className="space-y-4">
          {/* Top Row: Search and Primary Action */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search - Most Important Action */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search participants..."
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                className="h-8 w-full border-gray-300 bg-white pl-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>

            {/* Primary Action - Add Participant */}
            <Button
              onClick={onAddParticipant}
              className="h-8 bg-green-600 px-6 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </div>

          {/* Second Row: Secondary Actions and View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left side - Secondary Actions */}
            <div className="flex items-center gap-2">
              <OrganizationAssignmentButton
                subCounties={filterOptions.subCounties}
                organizations={organizations}
                className="h-9"
              />
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(true)}
                className="h-9 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="h-9 border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Right side - View Customization */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {availableColumns.map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={
                      columnVisibility[
                        column.id as keyof typeof columnVisibility
                      ]
                    }
                    onCheckedChange={checked =>
                      setColumnVisibility(prev => ({
                        ...prev,
                        [column.id]: !!checked,
                      }))
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters Section - Below action buttons */}
        <ParticipantFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          projects={projects}
          _clusters={clusters}
          organizations={organizations}
          districts={filterOptions.districts}
          subCounties={filterOptions.subCounties}
          enterprises={filterOptions.enterprises}
          searchTerm={searchValue}
          onSearchChange={onSearchChange}
        />

        {/* Participants Table - Primary interface now includes search and add actions */}
        <ParticipantsDataTable
          data={participants}
          clusterId={clusterId}
          pagination={(() => {
            const data = participantsData as ParticipantsResponse;
            if (data?.success && data.data) {
              return {
                page: pagination.page,
                limit: pagination.pageSize,
                total: data.data.pagination.total,
                totalPages: data.data.pagination.totalPages,
              };
            }
            return {
              page: pagination.page,
              limit: pagination.pageSize,
              total: 0,
              totalPages: 0,
            };
          })()}
          selectedProject={
            projects.find(p => p.id === filters.project)
              ? {
                  id: projects.find(p => p.id === filters.project)!.id,
                  name: projects.find(p => p.id === filters.project)!.name,
                  acronym: "",
                  description: null,
                  status: "active" as const,
                  startDate: null,
                  endDate: null,
                  createdAt: null,
                  updatedAt: null,
                }
              : null
          }
          selectedOrg={null}
          isLoading={isParticipantsLoading || locationNamesLoading}
          onPaginationChange={onPaginationChange}
          onPageChange={onPageChange}
          searchTerm={searchValue}
          onSearchChange={onSearchChange}
          onAddParticipant={onAddParticipant}
          onEditParticipant={onEditParticipant}
          onDeleteParticipant={onDeleteParticipant}
          onViewParticipant={onViewParticipant}
          onDeleteMultipleParticipants={ids => {
            // TODO: Implement bulk delete
            toast.success(`Selected ${ids.length} participants for deletion`);
          }}
          onExportData={handleExport}
          onImport={async data => {
            // TODO: Implement import
            toast.success(`Imported ${data.length} participants`);
            setIsImportDialogOpen(false);
          }}
          columnVisibility={columnVisibility}
        />
      </div>
    </TabsContent>
  );
}
