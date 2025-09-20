import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SubCountyOption } from "./types";

interface SubCountySelectorProps {
  subCounties: SubCountyOption[];
  selectedSubCounties: string[];
  onSubCountyToggle: (subCountyName: string) => void;
  onSelectAll: (subCounties: SubCountyOption[]) => void;
}

export function SubCountySelector({
  subCounties,
  selectedSubCounties,
  onSubCountyToggle,
  onSelectAll,
}: SubCountySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Available Subcounties</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelectAll(subCounties)}
        >
          {selectedSubCounties.length === subCounties?.length
            ? "Deselect All"
            : "Select All"}
        </Button>
      </div>

      <div className="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto rounded-md border p-3 md:grid-cols-3 lg:grid-cols-4">
        {subCounties?.map(sc => (
          <div key={sc.id} className="flex items-center space-x-2">
            <Checkbox
              id={sc.id}
              checked={selectedSubCounties.includes(sc.name)}
              onCheckedChange={() => onSubCountyToggle(sc.name)}
            />
            <label
              htmlFor={sc.id}
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {sc.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
