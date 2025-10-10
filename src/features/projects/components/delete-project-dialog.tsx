"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Project } from "../types";
import { deleteProject } from "../actions/projects";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface DeleteProjectDialogProps {
  project: Project;
  onDelete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteProjectDialog({
  project,
  onDelete,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteProjectDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Use controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteProject(project.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Project deleted successfully");
      router.refresh();
      onDelete?.();
      setOpen(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <>
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
    </>
  );

  return (
    <>
      <Toaster position="top-right" />
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete Project"
        description={`Are you sure you want to delete ${project.name}? This action cannot be undone.`}
        className="sm:max-w-[425px]"
        footer={footer}
      >
        <div className="py-4">
          <p>
            This action cannot be undone. All data associated with this project
            will be permanently deleted.
          </p>
        </div>
      </Modal>
    </>
  );
}
