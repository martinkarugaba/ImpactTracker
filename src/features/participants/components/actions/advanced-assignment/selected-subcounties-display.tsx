import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SelectedSubCountiesDisplayProps {
  selectedSubCounties: string[];
  onRemoveSubCounty: (subCountyName: string) => void;
}

export function SelectedSubCountiesDisplay({
  selectedSubCounties,
  onRemoveSubCounty,
}: SelectedSubCountiesDisplayProps) {
  if (selectedSubCounties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Selected Subcounties ({selectedSubCounties.length})
      </label>
      <div className="flex flex-wrap gap-2 rounded-md border bg-muted/50 p-3">
        {selectedSubCounties.map(subCounty => (
          <Badge
            key={subCounty}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {subCounty}
            <X
              className="h-3 w-3 cursor-pointer hover:text-red-500"
              onClick={() => onRemoveSubCounty(subCounty)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
