"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Users } from "lucide-react";
import { AdvancedAssignmentDialog } from "./advanced-assignment-dialog";

interface OrganizationAssignmentButtonProps {
  className?: string;
  subCounties?: Array<{ id: string; name: string }>;
  organizations?: Array<{ id: string; name: string; acronym: string }>;
}

export function OrganizationAssignmentButton({
  className,
  subCounties = [],
  organizations = [],
}: OrganizationAssignmentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const { data: session } = useSession();

  // Check if user has permission to fix organizations
  const hasPermission =
    session?.user?.role === "super_admin" ||
    session?.user?.role === "cluster_manager";

  // Don't render the button if user doesn't have permission
  if (!hasPermission) {
    return null;
  }

  const handleAdvancedAssignment = () => {
    setIsDialogOpen(false);
    setIsAdvancedDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 ${className || ""}`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Assign Organization
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organization Assignment</DialogTitle>
            <DialogDescription>
              Assign all participants from any subcounty to a specific
              organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Custom Assignment Section */}
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  Assign all participants from any subcounty to a specific
                  organization. This gives you full control over organization
                  assignments.
                </p>
                <Button
                  variant="outline"
                  onClick={handleAdvancedAssignment}
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Custom Assignment
                </Button>
              </div>
            </div>

            {/* Info Section */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-blue-600">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-medium">How it works</p>
                  <p>
                    This tool allows you to assign all participants from a
                    specific subcounty to any organization in your cluster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdvancedAssignmentDialog
        isOpen={isAdvancedDialogOpen}
        onOpenChange={setIsAdvancedDialogOpen}
        subCounties={subCounties}
        organizations={organizations}
      />
    </>
  );
}
