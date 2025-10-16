import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionsCell } from "./organization-table-actions";
import type { Organization } from "../types";
import type { Cluster } from "@/features/clusters/types";

interface OrganizationTableColumnsProps {
  clusters: Cluster[];
  onSelectOrganization: (org: Organization | null) => void;
}

export function getOrganizationTableColumns({
  clusters,
  onSelectOrganization,
}: OrganizationTableColumnsProps): ColumnDef<Organization>[] {
  return [
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
      enableHiding: true,
    },
    {
      accessorKey: "acronym",
      header: "Acronym",
      enableHiding: true,
    },
    {
      id: "cluster",
      header: "Cluster",
      enableHiding: true,
      cell: ({ row }) => {
        const organization = row.original;
        return organization.cluster ? (
          <Badge variant="outline">{organization.cluster.name}</Badge>
        ) : (
          <span className="text-muted-foreground">No cluster</span>
        );
      },
    },
    {
      id: "project",
      header: "Project",
      enableHiding: true,
      cell: ({ row }) => {
        const organization = row.original;
        return organization.project ? (
          <Badge variant="outline">{organization.project.acronym}</Badge>
        ) : (
          <span className="text-muted-foreground">No project</span>
        );
      },
    },
    {
      id: "district",
      header: "District",
      enableHiding: true,
      cell: ({ row }) => {
        const organization = row.original;
        return (
          <div className="text-sm">
            {organization.district || "No district"}
          </div>
        );
      },
    },
    {
      id: "operation_subcounties",
      header: "Operation Subcounties",
      enableHiding: true,
      cell: ({ row }) => {
        const organization = row.original;
        return (
          <div className="space-y-1">
            {organization.operation_sub_counties &&
            organization.operation_sub_counties.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {organization.operation_sub_counties
                  .slice(0, 2)
                  .map((subcounty: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-2 py-0.5 text-xs"
                    >
                      {subcounty}
                    </Badge>
                  ))}
                {organization.operation_sub_counties.length > 2 && (
                  <Badge variant="outline" className="px-2 py-0.5 text-xs">
                    +{organization.operation_sub_counties.length - 2} more
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No subcounties specified
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const organization = row.original;
        return (
          <ActionsCell
            organization={organization}
            clusters={clusters}
            onSelectOrganization={onSelectOrganization}
          />
        );
      },
    },
  ];
}
