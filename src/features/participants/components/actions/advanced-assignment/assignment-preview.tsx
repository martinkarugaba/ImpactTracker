import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import type { AssignmentLevel } from "../../advanced-assignment/types";

interface AssignmentPreviewProps {
  assignmentLevel: AssignmentLevel;
  selectedItems: string[];
  selectedOrganizationName?: string;
}

export function AssignmentPreview({
  assignmentLevel,
  selectedItems,
  selectedOrganizationName,
}: AssignmentPreviewProps) {
  if (selectedItems.length === 0 || !selectedOrganizationName) {
    return null;
  }

  const itemType = assignmentLevel === "subcounty" ? "subcounty" : "parish";
  const itemTypePlural =
    assignmentLevel === "subcounty" ? "subcounties" : "parishes";

  return (
    <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
        <Building2 className="h-4 w-4" />
        Assignment Preview
      </div>
      <div className="text-sm text-blue-700 dark:text-blue-300">
        All participants from{" "}
        <span className="font-medium">
          {selectedItems.length}{" "}
          {selectedItems.length > 1 ? itemTypePlural : itemType}
        </span>{" "}
        will be assigned to{" "}
        <Badge variant="default" className="font-medium">
          {selectedOrganizationName}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {selectedItems.slice(0, 5).map(item => (
          <Badge
            key={item}
            variant="outline"
            className="text-xs text-blue-600 dark:text-blue-300"
          >
            {item}
          </Badge>
        ))}
        {selectedItems.length > 5 && (
          <Badge
            variant="outline"
            className="text-xs text-blue-600 dark:text-blue-300"
          >
            +{selectedItems.length - 5} more
          </Badge>
        )}
      </div>
    </div>
  );
}
