"use client";

import { useState } from "react";
import { useParticipantTable } from "../../state/use-participant-table";
import { Button } from "@/components/ui/button";
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
  LayoutGrid,
  ChevronDown,
  Users,
} from "lucide-react";
import { ParticipantsDataTable } from "../participants-data-table";
import {
  type Participant,
  type ParticipantFilters as ParticipantFiltersType,
  type ParticipantsResponse,
} from "../../types/types";
import toast from "react-hot-toast";
import { SimpleParticipantFilters } from "../filters/simple-participant-filters";
import { OrganizationAssignmentButton } from "../actions/organization-assignment-button";
import { FixDuplicatesDialog } from "../data-table/fix-duplicates-dialog";

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
  onFiltersChange: _onFiltersChange,
  projects,
  clusters: _clusters,
  organizations,
  filterOptions,
  searchValue: _searchValue,
  onSearchChange: _onSearchChange,
  isParticipantsLoading,
  locationNamesLoading,
  onAddParticipant,
  onEditParticipant,
  onDeleteParticipant,
  onViewParticipant,
  onExportData,
  onImport,
  setIsImportDialogOpen,
  onPageChange,
  onPaginationChange,
}: ParticipantsTabProps) {
  const [isFixDuplicatesDialogOpen, setIsFixDuplicatesDialogOpen] =
    useState(false);

  // Use Jotai for column visibility state
  const { columnVisibility, setColumnVisibility } = useParticipantTable();

  // Available columns for toggle - matching actual column IDs from columns.tsx
  const availableColumns = [
    { id: "name", label: "Name" },
    { id: "sex", label: "Sex" },
    { id: "age", label: "Age" },
    { id: "contact", label: "Contact" },
    { id: "isPWD", label: "PWD Status" },
    { id: "organization", label: "Organization" },
    { id: "project", label: "Project" },
    { id: "location", label: "Location" },
    { id: "district", label: "District" },
    { id: "subCounty", label: "Sub County" },
    { id: "parish", label: "Parish" },
    { id: "village", label: "Village" },
    { id: "isSubscribedToVSLA", label: "VSLA Member" },
    { id: "vslaName", label: "VSLA Name" },
    { id: "ownsEnterprise", label: "Enterprise Owner" },
    { id: "enterpriseName", label: "Enterprise Name" },
    { id: "hasVocationalSkills", label: "Vocational Skills" },
    { id: "hasSoftSkills", label: "Soft Skills" },
    { id: "hasBusinessSkills", label: "Business Skills" },
    { id: "maritalStatus", label: "Marital Status" },
    { id: "educationLevel", label: "Education Level" },
    { id: "employmentStatus", label: "Employment Status" },
    { id: "monthlyIncome", label: "Monthly Income" },
    { id: "numberOfChildren", label: "Children" },
    { id: "isRefugee", label: "Refugee Status" },
    { id: "isMother", label: "Mother Status" },
    { id: "isTeenMother", label: "Teen Mother" },
    { id: "enterprise", label: "Enterprise" },
    { id: "designation", label: "Designation" },
  ];

  const handleExport = () => {
    onExportData();
  };

  return (
    <TabsContent value="participants" className="mt-6">
      <div className="space-y-6">
        {/* Enhanced Header Section with Better Visual Hierarchy */}
        <div className="space-y-4">
          {/* Action buttons and View Controls */}
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
                onClick={() => setIsFixDuplicatesDialogOpen(true)}
                className="h-9 border-orange-200 text-orange-700 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/50"
              >
                <Users className="mr-2 h-4 w-4" />
                Fix Duplicates
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

            {/* Right side - View Customization and Add Action */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">Columns</span>
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
              <Button
                onClick={onAddParticipant}
                className="h-9 bg-green-600 px-4 text-white focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Participant
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section - Below action buttons */}
        <SimpleParticipantFilters
          projects={projects}
          organizations={organizations}
          districts={filterOptions.districts}
          subCounties={filterOptions.subCounties}
          participants={participants}
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
          onAddParticipant={onAddParticipant}
          onEditParticipant={onEditParticipant}
          onDeleteParticipant={onDeleteParticipant}
          onViewParticipant={onViewParticipant}
          onDeleteMultipleParticipants={ids => {
            // TODO: Implement bulk delete
            toast.success(`Selected ${ids.length} participants for deletion`);
          }}
          onExportData={handleExport}
          onImport={onImport}
          columnVisibility={columnVisibility}
        />

        {/* Fix Duplicates Dialog */}
        <FixDuplicatesDialog
          open={isFixDuplicatesDialogOpen}
          onOpenChange={setIsFixDuplicatesDialogOpen}
          participants={participants}
          onDeleteParticipants={async (ids: string[]) => {
            // Use the existing bulk delete functionality
            ids.forEach(id => onDeleteParticipant(id));
            toast.success(`Deleted ${ids.length} duplicate participants`);
          }}
        />
      </div>
    </TabsContent>
  );
}
