"use client";

import { ColumnDef } from "@tanstack/react-table";
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
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";
import { VSLAMember } from "../../../actions/vsla-members";
import { formatCurrency } from "@/lib/utils";

interface CreateVSLAMembersColumnsProps {
  onMemberUpdated?: () => void;
  onEditMember?: (member: VSLAMember) => void;
}

// Simple date formatting function
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

export function createVSLAMembersColumns({
  onMemberUpdated: _onMemberUpdated,
  onEditMember,
}: CreateVSLAMembersColumnsProps): ColumnDef<VSLAMember>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex h-5 w-5 items-center justify-center">
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
        <div className="flex h-5 w-5 items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {member.first_name} {member.last_name}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  member.role === "chairperson" ||
                  member.role === "secretary" ||
                  member.role === "treasurer"
                    ? "default"
                    : "outline"
                }
                className="text-xs capitalize"
              >
                {member.role}
              </Badge>
              <Badge
                variant={
                  member.status === "active"
                    ? "default"
                    : member.status === "inactive"
                      ? "secondary"
                      : "destructive"
                }
                className="text-xs capitalize"
              >
                {member.status}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="space-y-1">
            {member.phone && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3" />
                <span>{member.email}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "joined_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(member.joined_date)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_savings",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Savings
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{formatCurrency(member.total_savings)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_loans",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Loans
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
            <TrendingUp className="h-3 w-3" />
            <span>{formatCurrency(member.total_loans)}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(member.id)}
              >
                Copy member ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEditMember?.(member)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Call Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from VSLA
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
  ];
}
