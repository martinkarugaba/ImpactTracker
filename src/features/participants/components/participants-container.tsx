"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload } from "lucide-react";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { getParticipantColumns } from "./table/columns";
import { CompactParticipantMetrics } from "./metrics/compact-participant-metrics";
import { DetailedParticipantMetrics } from "./metrics/detailed-participant-metrics";
import { ParticipantFilters } from "./participant-filters";
import { ImportParticipants } from "./import/import-participants";
import { useParticipants } from "../hooks/use-participants";
import { useParticipantMetrics } from "../hooks/use-participant-metrics";
import { useLocationNames } from "../hooks/use-location-names";
import { type Participant } from "../types/types";
import { type ParticipantFilters as ParticipantFiltersType } from "../types/types";
import { type ParticipantsResponse } from "../types/types";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ChevronDown } from "lucide-react";

interface ParticipantsContainerProps {
  clusterId: string;
  projects: Array<{ id: string; name: string }>;
  clusters: Array<{ id: string; name: string }>;
  organizations?: Array<{ id: string; name: string }>;
}

export function ParticipantsContainer({
  clusterId,
  projects,
  clusters,
  organizations = [],
}: ParticipantsContainerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ParticipantFiltersType>({
    search: "",
    project: "all",
    district: "all",
    sex: "all",
    isPWD: "all",
    ageGroup: "all",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] =
    useState<Participant | null>(null);
  const [applyFiltersToMetrics, setApplyFiltersToMetrics] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  // Fetch participants with filters and pagination
  const {
    data: participantsData,
    isLoading: isParticipantsLoading,
    error: participantsError,
  } = useParticipants(clusterId, {
    page: pagination.page,
    limit: pagination.pageSize,
    search: searchValue || undefined,
    filters: {
      project: filters.project || undefined,
      district: filters.district || undefined,
      sex: filters.sex || undefined,
      isPWD: filters.isPWD || undefined,
      ageGroup: filters.ageGroup || undefined,
    },
  });

  // Fetch metrics
  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useParticipantMetrics(
    clusterId,
    applyFiltersToMetrics ? filters : undefined
  );

  const participants = useMemo(() => {
    const data = participantsData as ParticipantsResponse;
    return data?.success ? data.data?.data || [] : [];
  }, [participantsData]);
  const metricsParticipants = metricsData || [];

  // Extract unique location IDs for batch fetching
  const locationIds = useMemo(() => {
    const districtIds = [
      ...new Set(
        participants.map((p: Participant) => p.district).filter(Boolean)
      ),
    ] as string[];
    const subCountyIds = [
      ...new Set(
        participants.map((p: Participant) => p.subCounty).filter(Boolean)
      ),
    ] as string[];
    const countryIds = [
      ...new Set(
        participants.map((p: Participant) => p.country).filter(Boolean)
      ),
    ] as string[];

    return { districtIds, subCountyIds, countryIds };
  }, [participants]);

  // Batch fetch all location names
  const locationNames = useLocationNames(
    locationIds.districtIds,
    locationIds.subCountyIds,
    locationIds.countryIds
  );

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [
    filters.project,
    filters.district,
    filters.sex,
    filters.isPWD,
    filters.ageGroup,
  ]);

  // Ensure local state stays in sync with server data
  useEffect(() => {
    const data = participantsData as ParticipantsResponse;
    if (data?.success && data.data?.pagination) {
      const serverPage = data.data.pagination.page;
      // Only update if the server page is different and we're not in the middle of a page change
      if (serverPage && serverPage !== pagination.page) {
        setPagination(prev => ({ ...prev, page: serverPage }));
      }
    }
  }, [participantsData, pagination.page]);

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
  };

  const handleDelete = (participant: Participant) => {
    setDeletingParticipant(participant);
  };

  const handleView = (participant: Participant) => {
    router.push(`/dashboard/participants/${participant.id}`);
  };

  const confirmDelete = async () => {
    if (!deletingParticipant) return;

    try {
      // TODO: Implement delete participant action
      toast.success("Participant deleted successfully.");
      setDeletingParticipant(null);
    } catch (_error) {
      toast.error("Failed to delete participant. Please try again.");
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast("Export functionality coming soon!");
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    // Use a function to ensure we always have the latest state
    setPagination(current => {
      // Only update if values actually changed to prevent unnecessary rerenders
      if (current.page === page && current.pageSize === pageSize) {
        return current;
      }
      return { page, pageSize };
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = getParticipantColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    locationNames,
  });

  if (participantsError || metricsError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading participants</h3>
          <p className="text-muted-foreground mt-2">
            {participantsError?.message ||
              metricsError?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <CompactParticipantMetrics
        participants={metricsParticipants}
        isLoading={isMetricsLoading}
      />

      {/* Overview Cards */}
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Participant Demographics</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Show Detailed Metrics
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
              <SheetHeader className="mb-6">
                <SheetTitle>Participant Metrics</SheetTitle>
                <SheetDescription>
                  Detailed breakdown of participant demographics and statistics
                </SheetDescription>
                <div className="mt-4 flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    <label
                      className="text-muted-foreground text-sm"
                      htmlFor="filter-toggle"
                    >
                      Apply filters to metrics
                    </label>
                    <Switch
                      id="filter-toggle"
                      checked={applyFiltersToMetrics}
                      onCheckedChange={setApplyFiltersToMetrics}
                    />
                  </div>
                </div>
              </SheetHeader>
              <div className="overflow-y-auto pr-1">
                <DetailedParticipantMetrics
                  participants={metricsParticipants}
                  isLoading={isMetricsLoading}
                  onFilterChange={filter => {
                    const newFilters = { ...filters };

                    switch (filter.type) {
                      case "gender":
                        newFilters.sex = filter.value;
                        break;
                      case "age":
                        // Handle age-based filters
                        const isYoung = filter.value.includes("young");
                        const isFemale = filter.value.includes("female");

                        newFilters.ageGroup = isYoung ? "young" : "older";
                        newFilters.sex = isFemale ? "female" : "male";
                        break;
                      case "disability":
                        newFilters.isPWD = "true";
                        if (filter.value !== "all") {
                          newFilters.sex = filter.value;
                        }
                        break;
                      case "all":
                        // Reset filters
                        newFilters.sex = "";
                        newFilters.ageGroup = "";
                        newFilters.isPWD = "";
                        break;
                    }

                    setFilters(newFilters);
                  }}
                  activeFilters={{
                    gender: filters.sex,
                    age:
                      filters.ageGroup &&
                      filters.sex &&
                      `${filters.ageGroup}-${filters.sex}`,
                    disability: filters.isPWD === "true",
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Participants</h2>
          <p className="text-muted-foreground">
            Manage and track all project participants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ParticipantFilters
        filters={filters}
        onFiltersChange={setFilters}
        projects={projects}
        _clusters={clusters}
        _organizations={organizations}
      />

      {/* Participants Table */}
      <ReusableDataTable
        columns={columns}
        data={participants}
        filterColumn="fullName"
        filterPlaceholder="Search participants..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={pagination.pageSize}
        onRowClick={handleView}
        isLoading={isParticipantsLoading || locationNames.isLoading}
        serverSidePagination={true}
        paginationData={(() => {
          const data = participantsData as ParticipantsResponse;
          return data?.success && data.data
            ? {
                ...data.data.pagination,
                // Ensure the page matches our local state to prevent flickering
                page: pagination.page,
              }
            : undefined;
        })()}
        onPaginationChange={handlePaginationChange}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingParticipant}
        onOpenChange={open => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingParticipant(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParticipant ? "Edit Participant" : "Add New Participant"}
            </DialogTitle>
            <DialogDescription>
              {editingParticipant
                ? "Update participant information below."
                : "Fill in the participant details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-muted-foreground text-center">
              Participant form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Participants</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import multiple participants at once.
            </DialogDescription>
          </DialogHeader>
          <ImportParticipants
            clusterId={clusterId}
            projects={projects}
            onImport={async () => {
              setIsImportDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingParticipant}
        onOpenChange={open => {
          if (!open) setDeletingParticipant(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              participant "{deletingParticipant?.firstName}{" "}
              {deletingParticipant?.lastName}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
