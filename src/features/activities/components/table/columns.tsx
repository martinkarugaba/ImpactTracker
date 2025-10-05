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

// Helper function to get activity type colors
const getTypeColor = (type: string) => {
  switch (type) {
    case "training":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "workshop":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
    case "meeting":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "field_visit":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "conference":
      return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800";
    case "seminar":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
    case "consultation":
      return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
  }
};

// Helper function to get status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "planned":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "ongoing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "postponed":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
  }
};

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
              className="h-auto justify-start p-0 text-left font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
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
          <Badge variant="outline" className={getTypeColor(type)}>
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

        return (
          <Badge variant="outline" className={getStatusColor(status)}>
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
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {count || 0}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "activityLeadName",
      header: "Activity Lead",
      cell: ({ row }) => {
        const activityLeadName = row.getValue("activityLeadName") as string;
        return (
          <Badge
            variant="secondary"
            className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
          >
            {activityLeadName || "Not assigned"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number;
        if (!budget)
          return <span className="text-muted-foreground text-sm">Not set</span>;

        return (
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            UGX {budget.toLocaleString()}
          </span>
        );
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
