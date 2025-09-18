"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { type DuplicateGroup } from "../../actions/find-all-duplicates";
import { useDuplicatesActions } from "./hooks";

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  index: number;
}

export function DuplicateGroupCard({ group, index }: DuplicateGroupCardProps) {
  const {
    handleSelectForDeletion,
    handleSelectAllInGroup,
    isGroupFullySelected,
    isGroupPartiallySelected,
    selectedForDeletion,
  } = useDuplicatesActions();

  const formatParticipantName = (
    participant: DuplicateGroup["participants"][0]
  ) => {
    return `${participant.firstName || ""} ${participant.lastName || ""}`.trim();
  };

  const formatContact = (contact: string | null) => {
    if (!contact) return "—";
    return contact.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  };

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h4 className="font-medium text-orange-900 dark:text-orange-100">
            Duplicate Group {index + 1}
          </h4>
          <Badge variant="outline" className="text-orange-700">
            {group.type === "name" ? "Name" : "Contact"} Match
          </Badge>
          <Badge variant="secondary">
            {group.participants.length} participants
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isGroupFullySelected(group)}
            ref={ref => {
              if (ref && "indeterminate" in ref) {
                (ref as HTMLInputElement).indeterminate =
                  isGroupPartiallySelected(group);
              }
            }}
            onCheckedChange={checked =>
              handleSelectAllInGroup(group, !!checked)
            }
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Select All in Group
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.participants.map(participant => (
              <TableRow key={participant.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedForDeletion.includes(participant.id)}
                    onCheckedChange={checked =>
                      handleSelectForDeletion(participant.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {formatParticipantName(participant)}
                </TableCell>
                <TableCell>{formatContact(participant.contact)}</TableCell>
                <TableCell>{participant.district || "—"}</TableCell>
                <TableCell>
                  {participant.organizationName ||
                    participant.organization_id ||
                    "—"}
                </TableCell>
                <TableCell>
                  {participant.created_at
                    ? new Date(participant.created_at).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
