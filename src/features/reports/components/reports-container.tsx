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
import { ReportsMetrics } from "./reports-metrics";
import { ReportFilters } from "./report-filters";
import { ReportsTable } from "./reports-table";
import { CreateReportDialog } from "./create-report-dialog";
import { ReportDetailsDialog } from "./report-details-dialog";
import {
  getReports,
  getReportsMetrics,
  type ReportsFilters,
  type ReportWithDetails,
  type ReportsMetrics as ReportsMetricsType,
} from "../actions/reports";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export function ReportsContainer() {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [metrics, setMetrics] = useState<ReportsMetricsType | null>(null);
  const [filters, setFilters] = useState<ReportsFilters>({});
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
  const [selectedReport, setSelectedReport] =
    useState<ReportWithDetails | null>(null);

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const result = await getReports(
        pagination.page,
        pagination.limit,
        filters
      );
      if (result.success && result.data) {
        setReports(result.data.reports);
        setPagination(prev => ({
          ...prev,
          ...result.data!.pagination,
        }));
      } else {
        toast.error(result.error || "Failed to load reports");
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    setIsMetricsLoading(true);
    try {
      const result = await getReportsMetrics();
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

  const handleFiltersChange = (newFilters: ReportsFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit: string) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1,
    }));
  };

  const handleViewReport = (report: ReportWithDetails) => {
    setSelectedReport(report);
    setIsDetailsDialogOpen(true);
  };

  const handleEditReport = (_report: ReportWithDetails) => {
    // TODO: Implement edit functionality
    toast("Edit functionality coming soon!");
  };

  const handleCreateSuccess = () => {
    loadReports();
    loadMetrics();
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <ReportsMetrics
        metrics={
          metrics || {
            totalReports: 0,
            draftReports: 0,
            submittedReports: 0,
            reviewedReports: 0,
            totalParticipants: 0,
            totalCost: 0,
            thisMonthReports: 0,
            lastMonthReports: 0,
          }
        }
        isLoading={isMetricsLoading}
      />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* Table */}
      <ReportsTable
        reports={reports}
        isLoading={isLoading}
        onViewReport={handleViewReport}
        onEditReport={handleEditReport}
        onCreateReport={() => setIsCreateDialogOpen(true)}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} reports
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Show:</span>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={handlePageSizeChange}
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
                  Previous
                </Button>

                <span className="text-muted-foreground text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Report Dialog */}
      <CreateReportDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Report Details Dialog */}
      <ReportDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}
