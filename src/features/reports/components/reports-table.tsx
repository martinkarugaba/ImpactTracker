"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
} from "lucide-react";
import { type ReportWithDetails } from "../actions/reports";

interface ReportsTableProps {
  reports: ReportWithDetails[];
  isLoading?: boolean;
  onViewReport: (report: ReportWithDetails) => void;
  onEditReport: (report: ReportWithDetails) => void;
  onCreateReport: () => void;
}

export function ReportsTable({
  reports,
  isLoading,
  onViewReport,
  onEditReport,
  onCreateReport,
}: ReportsTableProps) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getActivityTypeBadge = (type: string) => {
    const typeConfig = {
      meeting: { label: "Meeting", className: "bg-blue-100 text-blue-800" },
      workshop: { label: "Workshop", className: "bg-green-100 text-green-800" },
      training: {
        label: "Training",
        className: "bg-purple-100 text-purple-800",
      },
      field_visit: {
        label: "Field Visit",
        className: "bg-orange-100 text-orange-800",
      },
      conference: { label: "Conference", className: "bg-red-100 text-red-800" },
      seminar: { label: "Seminar", className: "bg-yellow-100 text-yellow-800" },
      consultation: {
        label: "Consultation",
        className: "bg-indigo-100 text-indigo-800",
      },
      assessment: {
        label: "Assessment",
        className: "bg-pink-100 text-pink-800",
      },
      monitoring: {
        label: "Monitoring",
        className: "bg-teal-100 text-teal-800",
      },
      evaluation: {
        label: "Evaluation",
        className: "bg-cyan-100 text-cyan-800",
      },
      community_engagement: {
        label: "Community",
        className: "bg-lime-100 text-lime-800",
      },
      capacity_building: {
        label: "Capacity",
        className: "bg-emerald-100 text-emerald-800",
      },
      advocacy: { label: "Advocacy", className: "bg-rose-100 text-rose-800" },
      research: {
        label: "Research",
        className: "bg-violet-100 text-violet-800",
      },
      other: { label: "Other", className: "bg-gray-100 text-gray-800" },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Reports
            </CardTitle>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Reports ({reports.length})
          </CardTitle>
          <Button onClick={onCreateReport} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No reports found</h3>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
              Get started by creating your first activity report.
            </p>
            <Button onClick={onCreateReport} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Report
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Title</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(report => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{report.title}</div>
                      <div className="text-muted-foreground text-sm">
                        By {report.team_leader}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{report.activity_title}</div>
                      <div className="text-muted-foreground text-sm">
                        {report.project_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.activity_type &&
                      getActivityTypeBadge(report.activity_type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(report.execution_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {report.venue}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3" />
                      {report.number_of_participants || "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(report.actual_cost)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewReport(report)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditReport(report)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
