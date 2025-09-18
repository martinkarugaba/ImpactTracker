import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import {
  assignParticipantsByMultipleSubCounties,
  assignParticipantsByMultipleParishes,
} from "../../../actions/fix-organization-assignments";
import {
  assignmentLevelAtom,
  selectedSubCountiesAtom,
  selectedParishesAtom,
  selectedOrganizationAtom,
  clearSelectionAtom,
  switchAssignmentLevelAtom,
  toggleSubCountyAtom,
  toggleParishAtom,
  removeSubCountyAtom,
  removeParishAtom,
  selectAllSubCountiesAtom,
  selectAllParishesAtom,
} from "./atoms";
import type { AssignmentLevel } from "../../advanced-assignment/types";
import type { SubCountyOption, ParishOption } from "./types";

export function useAdvancedAssignment() {
  const [assignmentLevel] = useAtom(assignmentLevelAtom);
  const [selectedSubCounties] = useAtom(selectedSubCountiesAtom);
  const [selectedParishes] = useAtom(selectedParishesAtom);
  const [selectedOrganization, setSelectedOrganization] = useAtom(
    selectedOrganizationAtom
  );
  const clearSelection = useSetAtom(clearSelectionAtom);
  const switchAssignmentLevel = useSetAtom(switchAssignmentLevelAtom);
  const toggleSubCounty = useSetAtom(toggleSubCountyAtom);
  const toggleParish = useSetAtom(toggleParishAtom);
  const removeSubCounty = useSetAtom(removeSubCountyAtom);
  const removeParish = useSetAtom(removeParishAtom);
  const selectAllSubCounties = useSetAtom(selectAllSubCountiesAtom);
  const selectAllParishes = useSetAtom(selectAllParishesAtom);
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async ({
      level,
      items,
      organizationId,
    }: {
      level: AssignmentLevel;
      items: string[];
      organizationId: string;
    }) => {
      if (level === "subcounty") {
        return await assignParticipantsByMultipleSubCounties(
          items,
          organizationId
        );
      } else {
        return await assignParticipantsByMultipleParishes(
          items,
          organizationId
        );
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });

      if (data.success) {
        toast.success(data.message || "Participants assigned successfully!");

        // Reset form but keep dialog open to show results
        clearSelection();
      } else {
        toast.error(data.error || "Assignment failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred during assignment");
    },
  });

  const handleLevelChange = (level: AssignmentLevel) => {
    switchAssignmentLevel(level);
  };

  const handleSubCountyToggle = (subCountyName: string) => {
    toggleSubCounty(subCountyName);
  };

  const handleParishToggle = (parishName: string) => {
    toggleParish(parishName);
  };

  const handleSelectAllSubCounties = (subCounties: SubCountyOption[]) => {
    selectAllSubCounties(subCounties);
  };

  const handleSelectAllParishes = (parishes: ParishOption[]) => {
    selectAllParishes(parishes);
  };

  const handleRemoveSubCounty = (subCountyName: string) => {
    removeSubCounty(subCountyName);
  };

  const handleRemoveParish = (parishName: string) => {
    removeParish(parishName);
  };

  const handleAssign = () => {
    const selectedItems =
      assignmentLevel === "subcounty" ? selectedSubCounties : selectedParishes;

    if (selectedItems.length === 0 || !selectedOrganization) {
      const itemType = assignmentLevel === "subcounty" ? "subcounty" : "parish";
      toast.error(`Please select at least one ${itemType} and an organization`);
      return;
    }

    assignMutation.mutate({
      level: assignmentLevel,
      items: selectedItems,
      organizationId: selectedOrganization,
    });
  };

  const getOrgDisplayName = (org: { name: string; acronym?: string }) => {
    if (org.acronym && org.acronym.trim()) {
      return `${org.acronym} (${org.name})`;
    }
    return org.name;
  };

  return {
    // State
    assignmentLevel,
    selectedSubCounties,
    selectedParishes,
    selectedOrganization,
    setSelectedOrganization,

    // Actions
    handleLevelChange,
    handleSubCountyToggle,
    handleParishToggle,
    handleSelectAllSubCounties,
    handleSelectAllParishes,
    handleRemoveSubCounty,
    handleRemoveParish,
    handleAssign,
    clearSelection,

    // Mutation
    assignMutation,

    // Utilities
    getOrgDisplayName,
  };
}
