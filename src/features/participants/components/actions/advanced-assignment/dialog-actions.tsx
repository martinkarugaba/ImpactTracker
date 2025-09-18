import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Building2 } from "lucide-react";
import type { AssignmentLevel } from "../../advanced-assignment/types";

interface DialogActionsProps {
  assignmentLevel: AssignmentLevel;
  selectedItems: string[];
  selectedOrganization: string;
  isPending: boolean;
  onAssign: () => void;
}

export function DialogActions({
  assignmentLevel,
  selectedItems,
  selectedOrganization,
  isPending,
  onAssign,
}: DialogActionsProps) {
  const itemType = assignmentLevel === "subcounty" ? "subcounty" : "parish";
  const itemTypePlural =
    assignmentLevel === "subcounty" ? "subcounties" : "parishes";

  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline" disabled={isPending}>
          Close
        </Button>
      </DialogClose>
      <Button
        onClick={onAssign}
        disabled={
          selectedItems.length === 0 || !selectedOrganization || isPending
        }
      >
        {isPending ? (
          "Assigning..."
        ) : (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Assign Participants
            {selectedItems.length > 0 &&
              ` (${selectedItems.length} ${selectedItems.length > 1 ? itemTypePlural : itemType})`}
          </>
        )}
      </Button>
    </DialogFooter>
  );
}
