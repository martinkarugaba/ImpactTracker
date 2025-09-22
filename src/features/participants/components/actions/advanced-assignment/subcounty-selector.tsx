import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/features/organizations/components/organization-form/location/MultiSelectCombobox";
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
  // Convert SubCountyOption[] to Option[] format expected by MultiSelectCombobox
  const options =
    subCounties?.map(sc => ({
      value: sc.name,
      label: sc.name,
    })) || [];

  const handleSelectionChange = (selected: string[]) => {
    // Calculate which items were added or removed and call onSubCountyToggle for each
    const currentSet = new Set(selectedSubCounties);
    const newSet = new Set(selected);

    // Find items that were added
    const added = selected.filter(item => !currentSet.has(item));
    // Find items that were removed
    const removed = selectedSubCounties.filter(item => !newSet.has(item));

    // Toggle each changed item
    [...added, ...removed].forEach(item => {
      onSubCountyToggle(item);
    });
  };

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

      <MultiSelectCombobox
        options={options}
        selected={selectedSubCounties}
        onChange={handleSelectionChange}
        placeholder="Select subcounties"
        emptyText="No subcounties found."
      />
    </div>
  );
}
