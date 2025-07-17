/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Button } from "@/components/ui/button";
import { Project } from "@/features/projects/types";
import { CreateProjectDialog } from "./create-project-dialog";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";

interface ProjectsTableProps {
  projects: Project[];
  clusters: {
    id: string;
    name: string;
    about: string | null;
    country: string;
    districts: string[];
    createdAt: Date | null;
    updatedAt: Date | null;
  }[];
}

// Create a separate component for the actions cell
function ActionsCell({
  project,
  onSelectProject,
}: {
  project: Project;
  onSelectProject: (project: Project | null) => void;
}) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectDialog
        project={project}
        onSelect={() => {
          setShowEditDialog(false);
          onSelectProject(project);
        }}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteProjectDialog
        project={project}
        onDelete={() => {
          setShowDeleteDialog(false);
          onSelectProject(null);
        }}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Define the columns for the projects table
  const columns: ColumnDef<Project>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "acronym",
      header: "Acronym",
      enableHiding: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      enableHiding: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      enableHiding: true,
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "status",
      header: "Status",
      enableHiding: true,
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "outline" | "secondary" | "destructive" =
          "outline";

        if (status === "active") {
          variant = "default";
        } else if (status === "completed") {
          variant = "secondary";
        } else if (status === "on-hold") {
          variant = "destructive";
        }

        return (
          <Badge variant={variant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      enableHiding: true,
      cell: ({ row }) => {
        const date = row.original.startDate;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      enableHiding: true,
      cell: ({ row }) => {
        const date = row.original.endDate;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <ActionsCell project={project} onSelectProject={setSelectedProject} />
        );
      },
    },
  ];

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto">
        <ReusableDataTable
          columns={columns}
          data={projects}
          filterColumn="name"
          filterPlaceholder="Filter by name..."
          showColumnToggle={true}
          showPagination={true}
          showRowSelection={true}
          pageSize={10}
          customActions={
            <CreateProjectDialog>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Add Project</span>
                <span className="lg:hidden">Add</span>
              </Button>
            </CreateProjectDialog>
          }
          customFilters={
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="active">Active Projects</SelectItem>
                <SelectItem value="completed">Completed Projects</SelectItem>
                <SelectItem value="on-hold">On Hold Projects</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>
    </div>
  );
}
