import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SelectedParishesDisplayProps {
  selectedParishes: string[];
  onRemoveParish: (parishName: string) => void;
}

export function SelectedParishesDisplay({
  selectedParishes,
  onRemoveParish,
}: SelectedParishesDisplayProps) {
  if (selectedParishes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No parishes selected</div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Selected Parishes ({selectedParishes.length})
      </label>
      <div className="flex flex-wrap gap-2">
        {selectedParishes.map(parish => (
          <Badge
            key={parish}
            variant="secondary"
            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onRemoveParish(parish)}
          >
            {parish}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
    </div>
  );
}
