"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { User } from "../types";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Pencil, Trash2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

import { userRole } from "@/lib/db/schema";

interface UsersTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onRoleChange?: (
    user: User,
    newRole: (typeof userRole.enumValues)[number]
  ) => void;
}

export function UsersTable({
  users,
  onEdit,
  onDelete,
  onRoleChange,
}: UsersTableProps) {
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  const handleEdit = (user: User) => {
    if (onEdit) {
      onEdit(user);
    }
  };

  const handleDelete = (user: User) => {
    if (onDelete) {
      onDelete(user);
    }
  };

  const handleRoleChange = (
    user: User,
    newRole: (typeof userRole.enumValues)[number]
  ) => {
    if (onRoleChange) {
      onRoleChange(user, newRole);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "cluster",
      header: "Cluster",
      cell: ({ row }) => {
        const cluster = row.original.cluster;
        return cluster ? (
          <Badge variant="secondary" className="capitalize">
            {cluster.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({ row }) => {
        const organization = row.original.organization;
        return organization ? (
          <Badge variant="outline" className="capitalize">
            {organization.acronym}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        const role = user.role;

        // Array of available roles from the schema
        const availableRoles: (typeof userRole.enumValues)[number][] = [
          "super_admin",
          "cluster_manager",
          "organization_admin",
          "organization_member",
          "user",
        ];

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-40 items-center justify-between gap-1 px-2"
              >
                <Badge variant="outline" className="capitalize">
                  {role.replace(/_/g, " ")}
                </Badge>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableRoles.map(availableRole => (
                <DropdownMenuItem
                  key={availableRole}
                  onClick={() => handleRoleChange(user, availableRole)}
                  className={role === availableRole ? "bg-muted" : ""}
                >
                  <span className="capitalize">
                    {availableRole.replace(/_/g, " ")}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(user)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}
      <div className="relative flex flex-col gap-4 overflow-auto">
        <ReusableDataTable
          columns={columns}
          data={users}
          filterColumn="email"
          filterPlaceholder="Filter by email..."
          showColumnToggle={true}
          showPagination={true}
          showRowSelection={true}
          pageSize={10}
          onRowSelectionChange={setSelectedRows}
        />
      </div>
    </div>
  );
}
