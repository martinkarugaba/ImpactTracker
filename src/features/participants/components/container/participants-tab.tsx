"use client";

import { useState, useRef } from "react";
import { useParticipantTable } from "../../state/use-participant-table";
import { useAtom } from "jotai";
import { exportDialogAtom, exportFormatAtom } from "../../atoms/export-atoms";
import { ExportOptionsDialog } from "../export/export-options-dialog";
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
  Trash2,
  Settings,
} from "lucide-react";
import {
  ParticipantsDataTable,
  type ParticipantsDataTableRef,
} from "../data-table/participants-data-table";
import { PaginationControls } from "../data-table/pagination-controls";
import {
  type Participant,
  type ParticipantFilters as ParticipantFiltersType,
  type ParticipantsResponse,
} from "../../types/types";
import toast from "react-hot-toast";
import { SimpleParticipantFilters } from "../filters/simple-participant-filters";
import { FixDuplicatesDialog } from "../fix-duplicates";
import { AdvancedAssignmentDialog } from "../actions/advanced-assignment-dialog";
import { useThemeConfig } from "@/features/themes/components/active-theme";
import { useSession } from "next-auth/react";
import { debugExcelExport } from "../../lib/excel-export-debug";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    counties: Array<{ id: string; name: string }>;
    parishes: Array<{ id: string; name: string }>;
    villages: Array<{ id: string; name: string }>;
    enterprises: Array<{ id: string; name: string }>;
  };
  searchValue: string;
  onSearchChange: (search: string) => void;
  isParticipantsLoading: boolean;
  isFiltering: boolean;
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
  isFiltering,
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
  const [isOrgAssignmentDialogOpen, setIsOrgAssignmentDialogOpen] =
    useState(false);
  const [isAdvancedAssignmentDialogOpen, setIsAdvancedAssignmentDialogOpen] =
    useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const dataTableRef = useRef<ParticipantsDataTableRef>(null);

  // Export dialog atoms for triggering the dialog
  const [, setIsExportDialogOpen] = useAtom(exportDialogAtom);
  const [, _setExportFormat] = useAtom(exportFormatAtom);

  // Handle export with options
  const handleExportWithOptions = (
    format: "csv" | "excel",
    _options: unknown
  ) => {
    // For now, just call the original export function
    // TODO: In the future, we can pass the options to modify the export format
    onExportData(format);
  };

  const { data: session } = useSession();

  // Check if user has permission to assign organizations
  const hasOrgAssignmentPermission =
    session?.user?.role === "super_admin" ||
    session?.user?.role === "cluster_manager";

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
              {/* Management Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {hasOrgAssignmentPermission && (
                    <DropdownMenuItem
                      onClick={() => setIsOrgAssignmentDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Assign Organization
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsFixDuplicatesDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Find Duplicates
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </Button>
              {/* Debug button for super_admins only */}
              {session?.user?.role === "super_admin" && (
                <Button
                  onClick={() => {
                    debugExcelExport();
                    toast.success("Debug info logged to console");
                  }}
                  variant="outline"
                  size="sm"
                >
                  🔍 Debug Excel
                </Button>
              )}
              <Button
                onClick={() => setIsExportDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              {selectedParticipants.length > 0 && (
                <>
                  <Button
                    onClick={() => {
                      // TODO: Implement bulk delete
                      toast.success(
                        `Selected ${selectedParticipants.length} participants for deletion`
                      );
                      dataTableRef.current?.clearSelection();
                      setSelectedParticipants([]);
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedParticipants.length})
                  </Button>
                  <Button
                    onClick={() => {
                      dataTableRef.current?.clearSelection();
                      setSelectedParticipants([]);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Selection
                  </Button>
                </>
              )}
            </div>

            {/* Right side - View Customization and Add Action */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
                        setColumnVisibility(
                          (prev: typeof columnVisibility) => ({
                            ...prev,
                            [column.id]: !!checked,
                          })
                        )
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
          participants={participants}
          isLoading={isParticipantsLoading}
          isFiltering={isFiltering}
          clusterId={clusterId}
        />

        {/* Pagination Controls - Right above table */}
        <div className="-mb-5 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {(() => {
              const data = participantsData as ParticipantsResponse;
              return data?.success && data.data
                ? `${data.data.pagination.total} total participants`
                : "0 total participants";
            })()}
          </div>
          <PaginationControls
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
            selectedCount={selectedParticipants.length}
            onPaginationChange={onPaginationChange}
            onPageChange={onPageChange}
            isLoading={isParticipantsLoading}
            position="top"
          />
        </div>

        {/* Participants Table - Primary interface now includes search and add actions */}
        <ParticipantsDataTable
          ref={dataTableRef}
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
          isFiltering={isFiltering}
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

        {/* Organization Assignment Dialog */}
        <Dialog
          open={isOrgAssignmentDialogOpen}
          onOpenChange={setIsOrgAssignmentDialogOpen}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Organization Assignment
              </DialogTitle>
              <DialogDescription>
                Fix participants with missing organization assignments or update
                existing assignments.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Choose an assignment method to fix organization assignments for
                participants.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setIsOrgAssignmentDialogOpen(false);
                    setIsAdvancedAssignmentDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Advanced Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Assignment Dialog */}
        <AdvancedAssignmentDialog
          isOpen={isAdvancedAssignmentDialogOpen}
          onOpenChange={setIsAdvancedAssignmentDialogOpen}
          subCounties={filterOptions.subCounties}
          organizations={organizations}
        />

        {/* Fix Duplicates Dialog - Enhanced to check all database */}
        <FixDuplicatesDialog
          open={isFixDuplicatesDialogOpen}
          onOpenChange={setIsFixDuplicatesDialogOpen}
          onDeleteCompleted={deletedCount => {
            toast.success(`Deleted ${deletedCount} duplicate participants`);
            // Optionally trigger a refresh of the participants data
          }}
        />

        {/* Export Options Dialog */}
        <ExportOptionsDialog
          onExport={handleExportWithOptions}
          participantCount={participants.length}
        />
      </div>
    </TabsContent>
  );
}
