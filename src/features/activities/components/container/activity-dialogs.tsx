"use client";

import { ActivityFormDialog } from "../forms/activity-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Activity } from "../../types/types";
import { useDeleteActivity } from "../../hooks/use-activities";
import toast from "react-hot-toast";

interface ActivityDialogsProps {
  clusterId?: string;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: (open: boolean) => void;
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  deletingActivity: Activity | null;
  setDeletingActivity: (activity: Activity | null) => void;
  clusterUsers: Array<{ id: string; name: string; email: string }>;
  clusters: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string; acronym?: string }>;
}

export function ActivityDialogs({
  clusterId,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isImportDialogOpen,
  setIsImportDialogOpen,
  editingActivity,
  setEditingActivity,
  deletingActivity,
  setDeletingActivity,
  clusterUsers,
  clusters,
  projects,
}: ActivityDialogsProps) {
  const deleteActivity = useDeleteActivity();

  const confirmDelete = async () => {
    if (!deletingActivity) return;

    try {
      await deleteActivity.mutateAsync({ id: deletingActivity.id });
      toast.success("Activity deleted successfully.");
      setDeletingActivity(null);
    } catch (_error) {
      toast.error("Failed to delete activity. Please try again.");
    }
  };

  return (
    <>
      {/* Create/Edit Dialog */}
      <ActivityFormDialog
        open={isCreateDialogOpen || !!editingActivity}
        onOpenChange={open => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingActivity(null);
          }
        }}
        activity={editingActivity || undefined}
        clusterId={clusterId}
        clusterUsers={clusterUsers}
        clusters={clusters}
        projects={projects}
      />

      {/* Import Dialog - TODO: Implement when needed */}
      {isImportDialogOpen && (
        <div>
          {/* Import dialog content will be implemented later */}
          <button onClick={() => setIsImportDialogOpen(false)}>
            Close Import Dialog
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingActivity}
        onOpenChange={open => {
          if (!open) setDeletingActivity(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              activity "{deletingActivity?.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
