"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Organization } from "../types";
import { deleteOrganization } from "../actions/organizations";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface DeleteOrganizationDialogProps {
  organization: Organization;
  onDelete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteOrganizationDialog({
  organization,
  onDelete,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteOrganizationDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Use controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;

  async function handleDelete() {
    setIsLoading(true);
    try {
      const result = await deleteOrganization(organization.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Organization deleted successfully");
      setOpen(false);
      router.refresh();
      onDelete?.();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Delete Organization
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {organization.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
