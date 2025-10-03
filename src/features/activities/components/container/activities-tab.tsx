"use client";

import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileUp, Plus, LayoutGrid, ChevronDown } from "lucide-react";
import { type Activity } from "../../types/types";
import { ActivityFiltersComponent } from "../filters/activity-filters";
import { ActivitiesDataTable } from "../data-table";
import {
  searchValueAtom,
  columnVisibilityAtom,
} from "../../atoms/activities-atoms";

interface ActivitiesTabProps {
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
  // Use atoms for state management
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [columnVisibility, setColumnVisibility] = useAtom(columnVisibilityAtom);

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
    <TabsContent value="activities" className="mt-0">
      <div className="space-y-4">
        {/* Action Buttons Section - At the very top */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Filters */}
          <ActivityFiltersComponent
            organizations={[]}
            clusters={[]}
            projects={[]}
          />

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

        {/* Activities Table - Below action buttons */}
        <ActivitiesDataTable
          data={activities}
          pagination={pagination}
          isLoading={isLoading}
          onPaginationChange={onPaginationChange}
          onPageChange={onPageChange}
          onSearchChange={setSearchValue}
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
