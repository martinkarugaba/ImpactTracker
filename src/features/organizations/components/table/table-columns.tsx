"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import { ActionsCell } from "./ActionsCell";

interface GetOrganizationTableColumnsProps {
  clusters: Cluster[];
  onSelectOrganization: (org: Organization | null) => void;
}

export function getOrganizationTableColumns({
  clusters,
  onSelectOrganization,
}: GetOrganizationTableColumnsProps): ColumnDef<Organization>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "acronym",
      header: "Acronym",
    },
    {
      accessorKey: "cluster_id",
      header: "Cluster",
      cell: ({ row }) => {
        const clusterId = row.original.cluster_id;
        const cluster = clusters.find(c => c.id === clusterId);
        return cluster?.name || "N/A";
      },
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "district",
      header: "District",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell
          organization={row.original}
          clusters={clusters}
          onSelectOrganization={onSelectOrganization}
        />
      ),
    },
  ];
}
