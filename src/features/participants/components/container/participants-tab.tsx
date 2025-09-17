"use client";

import { useState } from "react";
import { useParticipantTable } from "../../state/use-participant-table";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Download,
  Upload,
  LayoutGrid,
  ChevronDown,
  Users,
  FileSpreadsheet,
  FileText,
  Trash2,
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
import { EnhancedFixDuplicatesDialog } from "../data-table/enhanced-fix-duplicates-dialog";
import { useThemeConfig } from "@/features/themes/components/active-theme";

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
  onExportData: (format?: "csv" | "excel") => void;
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
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);

  // Get active theme for the Add Participant button
  const { activeTheme } = useThemeConfig();

  // Helper function to get theme colors
  const getThemeColors = (theme: string) => {
    const themeMap = {
      green:
        "bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800",
      blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800",
      red: "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800",
      orange:
        "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 dark:bg-orange-700 dark:hover:bg-orange-800",
      purple:
        "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-800",
      pink: "bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 dark:bg-pink-700 dark:hover:bg-pink-800",
      indigo:
        "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800",
      emerald:
        "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-800",
      teal: "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 dark:bg-teal-700 dark:hover:bg-teal-800",
      cyan: "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 dark:bg-cyan-700 dark:hover:bg-cyan-800",
      amber:
        "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-700 dark:hover:bg-amber-800",
      yellow:
        "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-800",
    };

    // Remove "-scaled" suffix if present
    const baseTheme = theme.replace("-scaled", "");
    return themeMap[baseTheme as keyof typeof themeMap] || themeMap.green;
  };

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
              />
              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                size="sm"
                className="border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </Button>
              <Button
                onClick={() => setIsFixDuplicatesDialogOpen(true)}
                variant="outline"
                size="sm"
                className="border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                <Users className="mr-2 h-4 w-4" />
                Find Duplicates
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-200 bg-purple-100 text-purple-800 hover:bg-purple-200 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onExportData("csv")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExportData("excel")}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedParticipants.length > 0 && (
                <Button
                  onClick={() => {
                    // TODO: Implement bulk delete
                    toast.success(
                      `Selected ${selectedParticipants.length} participants for deletion`
                    );
                    setSelectedParticipants([]);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-200 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedParticipants.length})
                </Button>
              )}
            </div>

            {/* Right side - View Customization and Add Action */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
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
                size="sm"
                className={`px-4 text-white ${getThemeColors(activeTheme)}`}
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
          onDeleteMultipleParticipants={undefined}
          onExportData={() => onExportData("csv")}
          onImport={onImport}
          columnVisibility={columnVisibility}
          onSelectedRowsChange={setSelectedParticipants}
        />

        {/* Fix Duplicates Dialog - Enhanced to check all database */}
        <EnhancedFixDuplicatesDialog
          open={isFixDuplicatesDialogOpen}
          onOpenChange={setIsFixDuplicatesDialogOpen}
          onDeleteCompleted={deletedCount => {
            toast.success(`Deleted ${deletedCount} duplicate participants`);
            // Optionally trigger a refresh of the participants data
          }}
        />
      </div>
    </TabsContent>
  );
}
