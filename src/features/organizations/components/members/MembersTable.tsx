"use client";

import { format } from "date-fns";
import { Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationMember } from "../../types";
import type { userRole } from "@/lib/db/schema";

interface MembersTableProps {
  members: OrganizationMember[];
  onRemoveMember: (userId: string) => Promise<void>;
  onUpdateRole: (
    userId: string,
    role: (typeof userRole.enumValues)[number]
  ) => Promise<void>;
  loadingStates: Record<string, boolean>;
}

export function MembersTable({
  members,
  onRemoveMember,
  onUpdateRole,
  loadingStates,
}: MembersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-muted-foreground py-6 text-center"
            >
              No members found. Add members to get started.
            </TableCell>
          </TableRow>
        ) : (
          members.map(member => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Select
                  value={member.role}
                  onValueChange={value =>
                    onUpdateRole(
                      member.id,
                      value as (typeof userRole.enumValues)[number]
                    )
                  }
                  disabled={loadingStates[member.id]}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization_admin">Admin</SelectItem>
                    <SelectItem value="organization_member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {member.created_at
                  ? format(new Date(member.created_at), "PPp")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {member.updated_at
                  ? format(new Date(member.updated_at), "PPp")
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveMember(member.id)}
                  disabled={loadingStates[member.id]}
                >
                  {loadingStates[member.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
