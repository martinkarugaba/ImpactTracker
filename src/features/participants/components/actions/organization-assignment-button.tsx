"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { fixKyarusoziAssignments } from "../../actions/fix-organization-assignments";
import { AdvancedAssignmentDialog } from "./advanced-assignment-dialog";

interface OrganizationAssignmentButtonProps {
  className?: string;
  subCounties?: Array<{ id: string; name: string }>;
  organizations?: Array<{ id: string; name: string }>;
}

export function OrganizationAssignmentButton({
  className,
  subCounties = [],
  organizations = [],
}: OrganizationAssignmentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for fixing Kyarusozi assignments
  const fixKyarusoziMutation = useMutation({
    mutationFn: fixKyarusoziAssignments,
    onSuccess: result => {
      if (result.success) {
        toast.success("Organization assignments fixed", {
          description: result.message,
        });
        // Invalidate participants query to refresh the table
        queryClient.invalidateQueries({ queryKey: ["participants"] });
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to fix assignments", {
          description: result.error,
        });
      }
    },
    onError: error => {
      toast.error("Error fixing assignments", {
        description: error.message,
      });
    },
  });

  const handleFixKyarusozi = () => {
    fixKyarusoziMutation.mutate();
  };

  const handleAdvancedAssignment = () => {
    setIsDialogOpen(false);
    setIsAdvancedDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Settings className="mr-2 h-4 w-4" />
            Fix Organizations
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fix Organization Assignments</DialogTitle>
            <DialogDescription>
              Correct participant organization assignments based on their
              subcounty location.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Known Issues Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Known Assignment Issues</h3>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Kyarusozi Town Council</p>
                    <p className="text-muted-foreground text-sm">
                      Participants from Kyarusozi are incorrectly assigned to
                      Blessed Pillars Foundation, but should belong to Balinda
                      Children's Foundation Uganda.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Wrong: Blessed Pillars
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        Correct: Balinda Children's
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleFixKyarusozi}
                    disabled={fixKyarusoziMutation.isPending}
                    className="ml-4"
                  >
                    {fixKyarusoziMutation.isPending ? (
                      "Fixing..."
                    ) : (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Fix Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {fixKyarusoziMutation.isSuccess &&
              fixKyarusoziMutation.data?.success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Assignment Fixed</span>
                  </div>
                  <p className="mt-1 text-sm text-green-700">
                    {fixKyarusoziMutation.data.message}
                  </p>
                  {fixKyarusoziMutation.data.details && (
                    <div className="mt-2 text-xs text-green-600">
                      <p>
                        Corrected{" "}
                        {fixKyarusoziMutation.data.details
                          .correctedAssignments || 0}{" "}
                        participants
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Advanced Assignment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Custom Assignment</h3>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground mb-3 text-sm">
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
                  Advanced Assignment
                </Button>
              </div>
            </div>

            {/* Info Section */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-blue-600">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-medium">How it works</p>
                  <p>
                    This tool identifies participants who are assigned to the
                    wrong organization based on their subcounty location and
                    corrects the assignments according to the established
                    mapping rules.
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
