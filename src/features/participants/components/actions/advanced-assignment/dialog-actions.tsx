import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface DialogActionsProps {
  selectedSubCounties: string[];
  selectedOrganization: string;
  isPending: boolean;
  onAssign: () => void;
}

export function DialogActions({
  selectedSubCounties,
  selectedOrganization,
  isPending,
  onAssign,
}: DialogActionsProps) {
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
          selectedSubCounties.length === 0 || !selectedOrganization || isPending
        }
      >
        {isPending ? (
          "Assigning..."
        ) : (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Assign Participants
            {selectedSubCounties.length > 0 &&
              ` (${selectedSubCounties.length} subcounty${selectedSubCounties.length > 1 ? "ies" : ""})`}
          </>
        )}
      </Button>
    </DialogFooter>
  );
}
