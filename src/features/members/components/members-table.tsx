"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash2, Users } from "lucide-react";
import { type ClusterMember } from "../actions/members";

interface MembersTableProps {
  members: ClusterMember[];
  isLoading: boolean;
  onViewMember: (member: ClusterMember) => void;
  onRemoveMember: (memberId: string) => void;
  isRemoving: { [key: string]: boolean };
}

export function MembersTable({
  members,
  isLoading,
  onViewMember,
  onRemoveMember,
  isRemoving,
}: MembersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No members found</h3>
        <p className="text-muted-foreground">
          No cluster members match your current filters.
        </p>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Added Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map(member => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="font-medium">{member.organization.name}</div>
                {member.organization.acronym && (
                  <div className="text-sm text-muted-foreground">
                    {member.organization.acronym}
                  </div>
                )}
                {member.organization.address && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {member.organization.address}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {member.project ? (
                  <div>
                    <div className="font-medium">
                      {member.project.acronym || member.project.name}
                    </div>
                    {member.project.acronym &&
                      member.project.name !== member.project.acronym && (
                        <div className="text-sm text-muted-foreground">
                          {member.project.name}
                        </div>
                      )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    No project assigned
                  </span>
                )}
              </TableCell>
              <TableCell>
                {member.organization.district || (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {member.organization.country || (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{formatDate(member.created_at)}</TableCell>
              <TableCell>
                <Badge variant="default" className="bg-green-500 text-white">
                  Active
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewMember(member)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRemoveMember(member.id)}
                      disabled={isRemoving[member.id]}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isRemoving[member.id] ? "Removing..." : "Remove Member"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
