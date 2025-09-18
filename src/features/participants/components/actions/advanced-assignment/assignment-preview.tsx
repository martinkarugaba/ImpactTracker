import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface AssignmentPreviewProps {
  selectedSubCounties: string[];
  selectedOrganizationName?: string;
}

export function AssignmentPreview({
  selectedSubCounties,
  selectedOrganizationName,
}: AssignmentPreviewProps) {
  if (selectedSubCounties.length === 0 || !selectedOrganizationName) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
        <Building2 className="h-4 w-4" />
        Assignment Preview
      </div>
      <div className="text-sm text-blue-700 dark:text-blue-300">
        All participants from{" "}
        <span className="font-medium">
          {selectedSubCounties.length} subcounty
          {selectedSubCounties.length > 1 ? "ies" : ""}
        </span>{" "}
        will be assigned to{" "}
        <Badge variant="default" className="font-medium">
          {selectedOrganizationName}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {selectedSubCounties.slice(0, 5).map(subCounty => (
          <Badge
            key={subCounty}
            variant="outline"
            className="text-xs text-blue-600 dark:text-blue-300"
          >
            {subCounty}
          </Badge>
        ))}
        {selectedSubCounties.length > 5 && (
          <Badge
            variant="outline"
            className="text-xs text-blue-600 dark:text-blue-300"
          >
            +{selectedSubCounties.length - 5} more
          </Badge>
        )}
      </div>
    </div>
  );
}
