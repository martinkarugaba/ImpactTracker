"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConceptNotesMetrics } from "./concept-notes-metrics";
import { ConceptNotesFilters } from "./concept-notes-filters";
import { ConceptNotesTable } from "./concept-notes-table";
import { CreateConceptNoteDialog } from "./create-concept-note-dialog";
import { ConceptNoteDetailsDialog } from "./concept-note-details-dialog";
import {
  getConceptNotes,
  getConceptNotesMetrics,
  type ConceptNotesFilters as ConceptNotesFiltersType,
  type ConceptNoteWithDetails,
  type ConceptNotesMetrics as ConceptNotesMetricsType,
} from "../actions/concept-notes";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export function ConceptNotesContainer() {
  const [conceptNotes, setConceptNotes] = useState<ConceptNoteWithDetails[]>(
    []
  );
  const [metrics, setMetrics] = useState<ConceptNotesMetricsType | null>(null);
  const [filters, setFilters] = useState<ConceptNotesFiltersType>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedConceptNote, setSelectedConceptNote] =
    useState<ConceptNoteWithDetails | null>(null);

  useEffect(() => {
    loadConceptNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadConceptNotes = async () => {
    setIsLoading(true);
    try {
      const result = await getConceptNotes(
        pagination.page,
        pagination.limit,
        filters
      );
      if (result.success && result.data) {
        setConceptNotes(result.data.conceptNotes);
        setPagination(prev => ({
          ...prev,
          ...result.data!.pagination,
        }));
      } else {
        toast.error(result.error || "Failed to load concept notes");
      }
    } catch (error) {
      console.error("Error loading concept notes:", error);
      toast.error("Failed to load concept notes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    setIsMetricsLoading(true);
    try {
      const result = await getConceptNotesMetrics();
      if (result.success && result.data) {
        setMetrics(result.data);
      } else {
        toast.error(result.error || "Failed to load metrics");
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
      toast.error("Failed to load metrics");
    } finally {
      setIsMetricsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: ConceptNotesFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1,
    }));
  };

  const handleViewConceptNote = (conceptNote: ConceptNoteWithDetails) => {
    setSelectedConceptNote(conceptNote);
    setIsDetailsDialogOpen(true);
  };

  const handleEditConceptNote = (_conceptNote: ConceptNoteWithDetails) => {
    // TODO: Implement edit functionality
    toast("Edit functionality coming soon!");
  };

  const handleCreateSuccess = () => {
    loadConceptNotes();
    loadMetrics();
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <ConceptNotesMetrics
        metrics={
          metrics || {
            totalConceptNotes: 0,
            pendingReview: 0,
            approved: 0,
            thisMonth: 0,
            trends: {
              totalChange: 0,
              pendingChange: 0,
              approvedChange: 0,
              monthlyChange: 0,
            },
          }
        }
        isLoading={isMetricsLoading}
      />

      {/* Filters */}
      <ConceptNotesFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* Table */}
      <ConceptNotesTable
        conceptNotes={conceptNotes}
        isLoading={isLoading}
        onViewConceptNote={handleViewConceptNote}
        onEditConceptNote={handleEditConceptNote}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} entries
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Show</span>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateConceptNoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ConceptNoteDetailsDialog
        conceptNote={selectedConceptNote}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedConceptNote(null);
        }}
      />
    </div>
  );
}
