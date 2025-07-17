"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Training } from "../types/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TrainingFormValues } from "./client/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TrainingForm } from "./training-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/features/projects/types";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";

interface TrainingFilters {
  project: string;
  status: string;
  organization: string;
}

interface TrainingsTableProps {
  data: Training[];
  isLoading?: boolean;
  tableIsLoading?: boolean;
  tableError?: string;
  onEdit: (training: Training) => void;
  onDelete: (training: Training) => void;
  onAdd: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingTraining: Training | null;
  handleSubmit: (data: TrainingFormValues) => Promise<void>;
  projects: Project[];
  organizations: { id: string; name: string }[];
  clusterId?: string;
  filters?: TrainingFilters;
  setFilters?: (name: keyof TrainingFilters, value: string) => void;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    pageCount: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (search: string) => void;
  searchTerm?: string;
  statuses?: { value: string; label: string }[];
}

export function TrainingsTable({
  data,
  onEdit,
  onDelete,
  onAdd,
  isOpen,
  setIsOpen,
  editingTraining,
  handleSubmit,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLoading = false,
  tableIsLoading = false,
  tableError,
  projects,
  organizations,
  clusterId,
  filters = {
    project: "all_projects",
    status: "all_statuses",
    organization: "all_organizations",
  },
  setFilters,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  searchTerm = "",
  statuses = [
    { value: "all_statuses", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ],
}: TrainingsTableProps) {
  const columns: ColumnDef<Training>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/trainings/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "venue",
      header: "Venue",
    },
    {
      accessorKey: "trainingDate",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("trainingDate")), "PPP"),
    },
    {
      accessorKey: "numberOfParticipants",
      header: "Participants",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "destructive" | "secondary" | "outline" =
          "default";

        switch (status) {
          case "pending":
            variant = "secondary";
            break;
          case "completed":
            variant = "default";
            break;
          case "cancelled":
            variant = "destructive";
            break;
          default:
            variant = "outline";
        }

        return (
          <Badge variant={variant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.preventDefault();
              onEdit(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.preventDefault();
              onDelete(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trainings</CardTitle>
            <CardDescription>Manage your training sessions</CardDescription>
          </div>
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Add Training</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Input
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={e => onSearchChange?.(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={filters.project}
              onValueChange={value => setFilters?.("project", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_projects">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={value => setFilters?.("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.organization}
              onValueChange={value => setFilters?.("organization", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_organizations">
                  All Organizations
                </SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tableError ? (
            <div className="text-destructive p-4 text-center">{tableError}</div>
          ) : (
            <ReusableDataTable
              columns={columns}
              data={data}
              isLoading={tableIsLoading}
              pageSize={pagination?.perPage || 10}
              serverSidePagination={!!pagination}
              paginationData={
                pagination
                  ? {
                      page: pagination.page,
                      limit: pagination.perPage,
                      total: pagination.total,
                      totalPages: pagination.pageCount,
                      hasNext: pagination.page < pagination.pageCount,
                      hasPrev: pagination.page > 1,
                    }
                  : undefined
              }
              onPaginationChange={
                onPageChange
                  ? (page, size) => {
                      onPageChange(page);
                      if (onPageSizeChange) onPageSizeChange(size);
                    }
                  : undefined
              }
              searchValue={searchTerm}
              onSearchChange={onSearchChange}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>
            {editingTraining ? "Edit Training" : "Create Training"}
          </DialogTitle>
          <DialogDescription>
            {editingTraining
              ? "Update the training details below"
              : "Fill out the form below to create a new training"}
          </DialogDescription>
          {/* Pass all required props including the submission handler */}
          <TrainingForm
            clusterId={editingTraining?.cluster_id || clusterId || ""}
            organizationId={
              editingTraining?.organization_id || organizations[0]?.id || ""
            }
            projectId={editingTraining?.project_id || projects[0]?.id || ""}
            initialData={editingTraining || undefined}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
