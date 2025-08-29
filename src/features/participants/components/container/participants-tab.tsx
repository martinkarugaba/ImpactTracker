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
  organizations: Array<{ id: string; name: string }>;
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
  });

  // Available columns for toggle
  const availableColumns = [
    { id: "fullName", label: "Name" },
    { id: "sex", label: "Gender" },
    { id: "age", label: "Age" },
    { id: "district", label: "District" },
    { id: "subCounty", label: "Sub County" },
    { id: "country", label: "Country" },
  ];

  const handleExport = () => {
    // Export functionality deactivated - coming soon modal will be shown
    console.log("Export functionality coming soon!");
  };

  return (
    <TabsContent value="participants" className="mt-4">
      <div className="space-y-4">
        {/* Action Buttons Section - At the very top */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Search */}
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search participants..."
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="w-80 pl-9"
            />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={onAddParticipant}>
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
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

        {/* Participants Table - Below filters */}
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
          onAddParticipant={async () => {
            onAddParticipant();
          }}
          onEditParticipant={onEditParticipant}
          onDeleteParticipant={onDeleteParticipant}
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
