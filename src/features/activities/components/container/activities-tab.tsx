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
  Download,
  FileUp,
  Plus,
  Search,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { type ActivityFilters, type Activity } from "../../types/types";
import { ActivityFiltersComponent } from "../filters/activity-filters";
import { ActivitiesDataTable } from "../data-table";

interface ActivitiesTabProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange: (page: number, limit: number) => void;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onDeleteMultipleActivities: (ids: string[]) => void;
  onExportData: () => void;
  onImport: (data: unknown[]) => void;
}

export function ActivitiesTab({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  activities,
  pagination,
  onPaginationChange,
  onPageChange,
  isLoading,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onDeleteMultipleActivities,
  onExportData,
  onImport,
}: ActivitiesTabProps) {
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    title: true,
    type: true,
    status: true,
    startDate: true,
    venue: false,
    participantCount: false,
    organizationName: true,
    budget: false,
  });

  // Available columns for toggle
  const availableColumns = [
    { id: "title", label: "Title" },
    { id: "type", label: "Type" },
    { id: "status", label: "Status" },
    { id: "startDate", label: "Date" },
    { id: "venue", label: "Venue" },
    { id: "participantCount", label: "Participants" },
    { id: "organizationName", label: "Organization" },
    { id: "budget", label: "Budget" },
  ];

  return (
    <TabsContent value="activities" className="mt-8">
      <div className="space-y-4">
        {/* Action Buttons Section - At the very top */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Search */}
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search activities..."
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="w-80 pl-9"
            />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
            <Button variant="outline" onClick={onExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => onImport([])}>
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={onAddActivity}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Filters Section - Below action buttons */}
        <ActivityFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          organizations={[]}
          clusters={[]}
          projects={[]}
        />

        {/* Activities Table - Below filters */}
        <ActivitiesDataTable
          data={activities}
          pagination={pagination}
          isLoading={isLoading}
          onPaginationChange={onPaginationChange}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          searchTerm={searchValue}
          onAddActivity={onAddActivity}
          onEditActivity={onEditActivity}
          onDeleteActivity={onDeleteActivity}
          onDeleteMultipleActivities={onDeleteMultipleActivities}
          onExportData={onExportData}
          onImport={onImport}
          columnVisibility={columnVisibility}
        />
      </div>
    </TabsContent>
  );
}
