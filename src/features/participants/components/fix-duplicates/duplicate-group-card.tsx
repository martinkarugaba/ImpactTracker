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

  // Check if all participants are from the same district
  const districts = [
    ...new Set(
      group.participants
        .map(p => p.district?.toLowerCase().trim())
        .filter(Boolean)
    ),
  ];
  const isMultiDistrict = districts.length > 1;
  const isSameDistrict = districts.length === 1;

  // Get district background color for each participant
  const getDistrictBadgeColor = (district: string | null) => {
    if (!district)
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    if (isMultiDistrict) {
      // Different colors for different districts when there are multiple
      const colors = [
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      ];
      const index = districts.indexOf(district.toLowerCase().trim());
      return colors[index % colors.length] || colors[0];
    }
    return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
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
          {isSameDistrict && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Same District
            </Badge>
          )}
          {isMultiDistrict && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              Multiple Districts
            </Badge>
          )}
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
              <TableHead>Date of Birth</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Sub County</TableHead>
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
                <TableCell>
                  {participant.dateOfBirth
                    ? new Date(participant.dateOfBirth).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  {participant.district ? (
                    <Badge
                      variant="outline"
                      className={`${getDistrictBadgeColor(participant.district)} border-0 font-medium`}
                    >
                      {participant.district}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </TableCell>
                <TableCell>{participant.subCounty || "—"}</TableCell>
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
