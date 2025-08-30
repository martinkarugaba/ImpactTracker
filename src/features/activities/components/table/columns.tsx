"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Activity } from "../../types/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ActivityColumnsProps {
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onView: (activity: Activity) => void;
}

export function getActivityColumns({
  onEdit,
  onDelete,
  onView,
}: ActivityColumnsProps): ColumnDef<Activity>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex h-10 w-10 items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex h-10 w-10 items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const activity = row.original;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const router = useRouter();

        return (
          <div className="flex flex-col space-y-1">
            <Button
              variant="link"
              className="h-auto justify-start p-0 text-left font-medium"
              onClick={() =>
                router.push(`/dashboard/activities/${activity.id}`)
              }
            >
              {activity.title}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const typeLabel = type
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <Badge variant="outline" className="capitalize">
            {typeLabel}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = {
          planned: "bg-blue-100 text-blue-800",
          ongoing: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
          postponed: "bg-gray-100 text-gray-800",
        };

        return (
          <Badge
            variant="secondary"
            className={statusColors[status as keyof typeof statusColors]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Date",
      cell: ({ row }) => {
        const startDate = row.getValue("startDate") as Date;
        const endDate = row.original.endDate;

        return (
          <div className="flex items-center space-x-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <div className="text-sm">
              <div>{format(new Date(startDate), "MMM dd, yyyy")}</div>
              {endDate && (
                <div className="text-muted-foreground">
                  to {format(new Date(endDate), "MMM dd, yyyy")}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "venue",
      header: "Venue",
      cell: ({ row }) => {
        const venue = row.getValue("venue") as string;
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">{venue}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "participantCount",
      header: "Participants",
      cell: ({ row }) => {
        const count = row.getValue("participantCount") as number;
        return (
          <div className="flex items-center space-x-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">{count || 0}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "organizationName",
      header: "Organization",
      cell: ({ row }) => {
        const organizationName = row.getValue("organizationName") as string;
        return <div className="text-sm">{organizationName}</div>;
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number;
        if (!budget) return <span className="text-muted-foreground">-</span>;

        return <div className="text-sm">${budget.toLocaleString()}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const activity = row.original;

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
              <DropdownMenuItem onClick={() => onView(activity)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(activity)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit activity
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(activity)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete activity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
