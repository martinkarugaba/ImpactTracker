import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import { assignParticipantsByMultipleSubCounties } from "../../../actions/fix-organization-assignments";
import {
  selectedSubCountiesAtom,
  selectedOrganizationAtom,
  clearSelectionAtom,
  toggleSubCountyAtom,
  removeSubCountyAtom,
  selectAllSubCountiesAtom,
} from "./atoms";
import type { SubCountyOption } from "./types";

export function useAdvancedAssignment() {
  const [selectedSubCounties] = useAtom(selectedSubCountiesAtom);
  const [selectedOrganization, setSelectedOrganization] = useAtom(
    selectedOrganizationAtom
  );
  const clearSelection = useSetAtom(clearSelectionAtom);
  const toggleSubCounty = useSetAtom(toggleSubCountyAtom);
  const removeSubCounty = useSetAtom(removeSubCountyAtom);
  const selectAllSubCounties = useSetAtom(selectAllSubCountiesAtom);
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async ({
      subCounties,
      organizationId,
    }: {
      subCounties: string[];
      organizationId: string;
    }) => {
      return await assignParticipantsByMultipleSubCounties(
        subCounties,
        organizationId
      );
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

  const handleSubCountyToggle = (subCountyName: string) => {
    toggleSubCounty(subCountyName);
  };

  const handleSelectAll = (subCounties: SubCountyOption[]) => {
    selectAllSubCounties(subCounties);
  };

  const handleRemoveSubCounty = (subCountyName: string) => {
    removeSubCounty(subCountyName);
  };

  const handleAssign = () => {
    if (selectedSubCounties.length === 0 || !selectedOrganization) {
      toast.error("Please select at least one subcounty and an organization");
      return;
    }

    assignMutation.mutate({
      subCounties: selectedSubCounties,
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
    selectedSubCounties,
    selectedOrganization,
    setSelectedOrganization,

    // Actions
    handleSubCountyToggle,
    handleSelectAll,
    handleRemoveSubCounty,
    handleAssign,
    clearSelection,

    // Mutation
    assignMutation,

    // Utilities
    getOrgDisplayName,
  };
}
