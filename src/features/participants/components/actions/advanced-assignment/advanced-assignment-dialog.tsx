"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { useAdvancedAssignment } from "./hooks";
import { OrganizationSelector } from "./organization-selector";
import { SelectedSubCountiesDisplay } from "./selected-subcounties-display";
import { SubCountySelector } from "./subcounty-selector";
import { AssignmentPreview } from "./assignment-preview";
import { AssignmentResults } from "./assignment-results";
import { DialogActions } from "./dialog-actions";
import type { AdvancedAssignmentDialogProps } from "./types";

export function AdvancedAssignmentDialog({
  isOpen,
  onOpenChange,
  subCounties,
  organizations,
}: AdvancedAssignmentDialogProps) {
  const {
    selectedSubCounties,
    selectedOrganization,
    setSelectedOrganization,
    handleSubCountyToggle,
    handleSelectAll,
    handleRemoveSubCounty,
    handleAssign,
    assignMutation,
    getOrgDisplayName,
  } = useAdvancedAssignment();

  const selectedOrg = organizations.find(
    org => org.id === selectedOrganization
  );
  const selectedOrganizationName = selectedOrg
    ? getOrgDisplayName(selectedOrg)
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Users className="mr-2 inline h-5 w-5" />
            Assign Multiple Subcounties
          </DialogTitle>
          <DialogDescription>
            Select multiple subcounties and assign all their participants to a
            single organization at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <OrganizationSelector
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onOrganizationChange={setSelectedOrganization}
            getOrgDisplayName={getOrgDisplayName}
          />

          <SelectedSubCountiesDisplay
            selectedSubCounties={selectedSubCounties}
            onRemoveSubCounty={handleRemoveSubCounty}
          />

          <SubCountySelector
            subCounties={subCounties}
            selectedSubCounties={selectedSubCounties}
            onSubCountyToggle={handleSubCountyToggle}
            onSelectAll={handleSelectAll}
          />

          <AssignmentPreview
            selectedSubCounties={selectedSubCounties}
            selectedOrganizationName={selectedOrganizationName}
          />

          <AssignmentResults
            assignmentData={assignMutation.data}
            isSuccess={assignMutation.isSuccess}
            isError={assignMutation.isError}
            error={assignMutation.error}
          />
        </div>

        <DialogActions
          selectedSubCounties={selectedSubCounties}
          selectedOrganization={selectedOrganization}
          isPending={assignMutation.isPending}
          onAssign={handleAssign}
        />
      </DialogContent>
    </Dialog>
  );
}
