import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ParishOption } from "./types";

interface ParishSelectorProps {
  parishes: ParishOption[];
  selectedParishes: string[];
  onParishToggle: (parishName: string) => void;
  onSelectAll: (parishes: ParishOption[]) => void;
}

export function ParishSelector({
  parishes,
  selectedParishes,
  onParishToggle,
  onSelectAll,
}: ParishSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Available Parishes</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelectAll(parishes)}
        >
          {selectedParishes.length === parishes?.length
            ? "Deselect All"
            : "Select All"}
        </Button>
      </div>

      <div className="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto rounded-md border p-3 md:grid-cols-3 lg:grid-cols-4">
        {parishes?.map(parish => (
          <div key={parish.id} className="flex items-center space-x-2">
            <Checkbox
              id={parish.id}
              checked={selectedParishes.includes(parish.name)}
              onCheckedChange={() => onParishToggle(parish.name)}
            />
            <label
              htmlFor={parish.id}
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {parish.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
