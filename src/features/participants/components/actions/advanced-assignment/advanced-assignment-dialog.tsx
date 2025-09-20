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
import { SelectedParishesDisplay } from "./selected-parishes-display";
import { SubCountySelector } from "./subcounty-selector";
import { ParishSelector } from "./parish-selector";
import { AssignmentLevelTabs } from "./assignment-level-tabs";
import { AssignmentPreview } from "./assignment-preview";
import { AssignmentResults } from "./assignment-results";
import { DialogActions } from "./dialog-actions";
import type { AdvancedAssignmentDialogProps } from "./types";

export function AdvancedAssignmentDialog({
  isOpen,
  onOpenChange,
  subCounties,
  parishes = [], // Add parishes prop with default
  organizations,
}: AdvancedAssignmentDialogProps) {
  const {
    assignmentLevel,
    selectedSubCounties,
    selectedParishes,
    selectedOrganization,
    setSelectedOrganization,
    handleLevelChange,
    handleSubCountyToggle,
    handleParishToggle,
    handleSelectAllSubCounties,
    handleSelectAllParishes,
    handleRemoveSubCounty,
    handleRemoveParish,
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

  const isSubCountyMode = assignmentLevel === "subcounty";
  const selectedItems = isSubCountyMode
    ? selectedSubCounties
    : selectedParishes;

  // Transform parishes to include selected property
  const parishOptions = parishes.map(parish => ({
    ...parish,
    selected: selectedParishes.includes(parish.name),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Users className="mr-2 inline h-5 w-5" />
            Assign Multiple {isSubCountyMode ? "Subcounties" : "Parishes"}
          </DialogTitle>
          <DialogDescription>
            Select multiple {isSubCountyMode ? "subcounties" : "parishes"} and
            assign all their participants to a single organization at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <OrganizationSelector
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onOrganizationChange={setSelectedOrganization}
            getOrgDisplayName={getOrgDisplayName}
          />

          <AssignmentLevelTabs
            currentLevel={assignmentLevel}
            onLevelChange={handleLevelChange}
          >
            {isSubCountyMode ? (
              <>
                <SelectedSubCountiesDisplay
                  selectedSubCounties={selectedSubCounties}
                  onRemoveSubCounty={handleRemoveSubCounty}
                />

                <SubCountySelector
                  subCounties={subCounties}
                  selectedSubCounties={selectedSubCounties}
                  onSubCountyToggle={handleSubCountyToggle}
                  onSelectAll={handleSelectAllSubCounties}
                />
              </>
            ) : (
              <>
                <SelectedParishesDisplay
                  selectedParishes={selectedParishes}
                  onRemoveParish={handleRemoveParish}
                />

                <ParishSelector
                  parishes={parishOptions}
                  selectedParishes={selectedParishes}
                  onParishToggle={handleParishToggle}
                  onSelectAll={handleSelectAllParishes}
                />
              </>
            )}
          </AssignmentLevelTabs>

          <AssignmentPreview
            assignmentLevel={assignmentLevel}
            selectedItems={selectedItems}
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
          assignmentLevel={assignmentLevel}
          selectedItems={selectedItems}
          selectedOrganization={selectedOrganization}
          isPending={assignMutation.isPending}
          onAssign={handleAssign}
        />
      </DialogContent>
    </Dialog>
  );
}
