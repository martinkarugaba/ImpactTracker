import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/features/organizations/components/organization-form/location/MultiSelectCombobox";
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
  // Convert ParishOption[] to Option[] format expected by MultiSelectCombobox
  const options =
    parishes?.map(parish => ({
      value: parish.name,
      label: parish.name,
    })) || [];

  const handleSelectionChange = (selected: string[]) => {
    // Calculate which items were added or removed and call onParishToggle for each
    const currentSet = new Set(selectedParishes);
    const newSet = new Set(selected);

    // Find items that were added
    const added = selected.filter(item => !currentSet.has(item));
    // Find items that were removed
    const removed = selectedParishes.filter(item => !newSet.has(item));

    // Toggle each changed item
    [...added, ...removed].forEach(item => {
      onParishToggle(item);
    });
  };

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

      <MultiSelectCombobox
        options={options}
        selected={selectedParishes}
        onChange={handleSelectionChange}
        placeholder="Select parishes"
        emptyText="No parishes found."
      />
    </div>
  );
}
