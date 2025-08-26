"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ParticipantsDataTable } from "./participants-data-table";
import { CompactParticipantMetrics } from "./metrics/compact-participant-metrics";
import { DetailedParticipantMetrics } from "./metrics/detailed-participant-metrics";
import { ParticipantMetricsCharts } from "./metrics/participant-metrics-charts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, BarChart3, Users } from "lucide-react";

interface ParticipantsContainerProps {
  clusterId: string;
  projects: Array<{ id: string; name: string; acronym: string }>;
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
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("participants");

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
      project: filters.project !== "all" ? filters.project : undefined,
      district: filters.district !== "all" ? filters.district : undefined,
      sex: filters.sex !== "all" ? filters.sex : undefined,
      isPWD: filters.isPWD !== "all" ? filters.isPWD : undefined,
      ageGroup: filters.ageGroup !== "all" ? filters.ageGroup : undefined,
    },
  });

  // Debug log to see what filters are being applied
  console.log("🔍 Current filters state:", filters);
  console.log("🔍 Filters being passed to useParticipants:", {
    project: filters.project !== "all" ? filters.project : undefined,
    district: filters.district !== "all" ? filters.district : undefined,
    sex: filters.sex !== "all" ? filters.sex : undefined,
    isPWD: filters.isPWD !== "all" ? filters.isPWD : undefined,
    ageGroup: filters.ageGroup !== "all" ? filters.ageGroup : undefined,
  });

  // Always apply filters to metrics - they should reflect the current filter state
  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useParticipantMetrics(clusterId, filters);

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
    searchValue, // Also reset when search changes
  ]);

  // Don't sync pagination state with server response to prevent flickering
  // The server pagination is handled by React Query and will be reflected in the paginationData

  const _handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
  };

  const _handleDelete = (participant: Participant) => {
    setDeletingParticipant(participant);
  };

  const _handleView = (participant: Participant) => {
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
    console.log(
      `ParticipantsContainer: Setting pagination to page=${page}, pageSize=${pageSize}`
    );
    setPagination({ page, pageSize });
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

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
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Participants</h2>
          <p className="text-muted-foreground">
            Manage and track all project participants
          </p>
        </div>
      </div> */}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Metrics Cards */}
          <div className="space-y-3">
            {/* Metrics Header with Filter Status */}
            {(() => {
              const hasActiveFilters = Object.entries(filters).some(
                ([key, value]) => {
                  if (key === "search") return value && value.trim() !== "";
                  return value && value !== "all" && value !== "";
                }
              );

              if (hasActiveFilters) {
                return (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="bg-primary h-2 w-2 rounded-full"></div>
                      <span>Metrics reflect current filters</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <CompactParticipantMetrics
              participants={metricsParticipants}
              isLoading={isMetricsLoading}
            />
          </div>

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
                      Detailed breakdown of participant demographics and
                      statistics. Metrics automatically reflect your current
                      filter selections.
                    </SheetDescription>
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

          {/* Filters for Metrics */}
          <ParticipantFilters
            filters={filters}
            onFiltersChange={setFilters}
            projects={projects}
            _clusters={clusters}
            _organizations={organizations}
            searchTerm={searchValue}
            onSearchChange={handleSearchChange}
          />

          {/* Charts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visual Analytics</h3>
            <ParticipantMetricsCharts
              participants={metricsParticipants}
              isLoading={isMetricsLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          {/* Filters */}
          <ParticipantFilters
            filters={filters}
            onFiltersChange={setFilters}
            projects={projects}
            _clusters={clusters}
            _organizations={organizations}
            searchTerm={searchValue}
            onSearchChange={handleSearchChange}
          />

          {/* Participants Table */}
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
            isLoading={isParticipantsLoading || locationNames.isLoading}
            onPaginationChange={handlePaginationChange}
            onPageChange={page =>
              handlePaginationChange(page, pagination.pageSize)
            }
            searchTerm={searchValue}
            onSearchChange={handleSearchChange}
            onAddParticipant={async () => {
              setIsCreateDialogOpen(true);
            }}
            onEditParticipant={(data, id) => {
              const participant = participants.find(p => p.id === id);
              if (participant) {
                setEditingParticipant(participant);
              }
            }}
            onDeleteParticipant={id => {
              const participant = participants.find(p => p.id === id);
              if (participant) {
                setDeletingParticipant(participant);
              }
            }}
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
          />
        </TabsContent>
      </Tabs>

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
            onImportComplete={async () => {
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
