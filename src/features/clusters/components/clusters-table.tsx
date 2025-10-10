"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCluster } from "../actions/clusters";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateClusterDialog } from "./create-cluster-dialog";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";

export interface Cluster {
  id: string;
  name: string;
  about: string | null;
  country: string;
  districts: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

const columns: ColumnDef<Cluster>[] = [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "districts",
    header: "Districts",
    cell: ({ row }) => {
      const districts = row.getValue("districts") as string[];
      return districts.join(", ");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const cluster = row.original;
      return <ClusterActions cluster={cluster} />;
    },
  },
];

function ClusterActions({ cluster }: { cluster: Cluster }) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const result = await deleteCluster(cluster.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Cluster deleted successfully");
      router.refresh();
    } catch {
      toast.error("Failed to delete cluster");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/clusters/${cluster.id}`)}
        >
          Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/clusters/${cluster.id}`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ClustersTable({ data }: { data: Cluster[] }) {
  return (
    <div className="w-full">
      <ReusableDataTable
        columns={columns}
        data={data}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={10}
        customActions={
          <CreateClusterDialog>
            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Cluster</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </CreateClusterDialog>
        }
      />
    </div>
  );
}
