import { toast } from "sonner";
import { type Participant } from "../../types/types";
import {
  useCreateParticipant,
  useUpdateParticipant,
  useDeleteParticipant,
  useBulkCreateParticipants,
} from "../../hooks/use-participants";
import { type ParticipantFormValues } from "../participant-form";
import { type ParticipantSubmitData } from "./types";
import {
  transformImportData,
  transformParticipantData,
} from "./participant-transformer";

interface UseParticipantFormHandlersProps {
  clusterId: string;
  onSetIsLoading: (loading: boolean) => void;
  onSetIsOpen: (open: boolean) => void;
  onSetEditingParticipant: (participant: Participant | null) => void;
}

export function useParticipantFormHandlers({
  clusterId,
  onSetIsLoading,
  onSetIsOpen,
  onSetEditingParticipant,
}: UseParticipantFormHandlersProps) {
  const createParticipant = useCreateParticipant();
  const bulkCreateParticipants = useBulkCreateParticipants();
  const updateParticipant = useUpdateParticipant();
  const deleteParticipant = useDeleteParticipant(clusterId);

  const handleSubmit = async (formData: ParticipantSubmitData) => {
    try {
      // Transform form data to match database types
      const data = transformParticipantData(formData, clusterId);

      // Check if we're updating or creating a new participant
      if (formData.id) {
        // Make sure we have a cluster ID
        if (!clusterId) {
          toast.error("Cluster ID is required");
          return;
        }

        const result = await updateParticipant.mutateAsync({
          id: formData.id,
          data: {
            cluster_id: clusterId,
            project_id: data.project_id,
            firstName: data.firstName,
            lastName: data.lastName,
            country: data.country,
            district: data.district,
            subCounty: data.subCounty,
            parish: data.parish,
            village: data.village,
            sex: data.sex,
            age: data.age ?? null,
            dateOfBirth: null,
            isPWD: data.isPWD ? "yes" : "no",
            isMother: data.isMother ? "yes" : "no",
            isRefugee: data.isRefugee ? "yes" : "no",
            designation: data.designation,
            enterprise: data.enterprise,
            contact: data.contact,
            organization_id: data.organization_id,
            noOfTrainings: data.noOfTrainings,
            isActive: data.isActive ? "yes" : "no",
            isPermanentResident: data.isPermanentResident ? "yes" : "no",
            areParentsAlive: data.areParentsAlive ? "yes" : "no",
            numberOfChildren: data.numberOfChildren,
            employmentStatus: data.employmentStatus,
            monthlyIncome: data.monthlyIncome,
            mainChallenge: data.mainChallenge || null,
            skillOfInterest: data.skillOfInterest || null,
            expectedImpact: data.expectedImpact || null,
            isWillingToParticipate: data.isWillingToParticipate ? "yes" : "no",
          },
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to update participant");
        }
        toast.success("Participant updated successfully");
      } else {
        // Make sure we have a cluster ID
        if (!clusterId) {
          toast.error("Cluster ID is required");
          return;
        }

        const result = await createParticipant.mutateAsync({
          cluster_id: clusterId,
          project_id: data.project_id,
          firstName: data.firstName,
          lastName: data.lastName,
          country: data.country,
          district: data.district,
          subCounty: data.subCounty,
          parish: data.parish,
          village: data.village,
          sex: data.sex,
          age: data.age ?? null,
          dateOfBirth: null,
          isPWD: data.isPWD ? "yes" : "no",
          isMother: data.isMother ? "yes" : "no",
          isRefugee: data.isRefugee ? "yes" : "no",
          designation: data.designation,
          enterprise: data.enterprise,
          contact: data.contact,
          organization_id: data.organization_id,
          noOfTrainings: data.noOfTrainings,
          isActive: data.isActive ? "yes" : "no",
          isPermanentResident: data.isPermanentResident ? "yes" : "no",
          areParentsAlive: data.areParentsAlive ? "yes" : "no",
          numberOfChildren: data.numberOfChildren,
          employmentStatus: data.employmentStatus,
          monthlyIncome: data.monthlyIncome,
          mainChallenge: data.mainChallenge || null,
          skillOfInterest: data.skillOfInterest || null,
          expectedImpact: data.expectedImpact || null,
          isWillingToParticipate: data.isWillingToParticipate ? "yes" : "no",
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to create participant");
        }
        toast.success("Participant created successfully");
      }

      onSetIsOpen(false);
      onSetEditingParticipant(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  const handleImportParticipants = async (data: ParticipantFormValues[]) => {
    console.log("=== FRONTEND IMPORT HANDLER CALLED ===");
    console.log("Data received in handler:", data.length, "participants");
    console.log("Sample data:", JSON.stringify(data[0], null, 2));

    onSetIsLoading(true);
    const toastId = toast.loading(`Importing ${data.length} participants...`);

    try {
      console.log("ClusterId being used:", clusterId);

      // Verify required fields again before transformation
      const missingRequired = data.filter(
        p => !p.project_id || !p.organization_id || !p.cluster_id
      );
      if (missingRequired.length > 0) {
        console.error(
          "Participants missing required fields:",
          missingRequired.length
        );
        console.error(
          "Example missing fields:",
          JSON.stringify(missingRequired[0], null, 2)
        );
        throw new Error(
          `${missingRequired.length} participants have missing required fields (project_id, organization_id, cluster_id)`
        );
      }

      const transformedData = transformImportData(data, clusterId);
      console.log(
        "Transformed data (first participant):",
        JSON.stringify(transformedData[0], null, 2)
      );

      // Verify all transformedData has required fields
      const missingAfterTransform = transformedData.filter(
        p => !p.project_id || !p.organization_id || !p.cluster_id
      );
      if (missingAfterTransform.length > 0) {
        console.error(
          "After transform, missing fields:",
          missingAfterTransform.length
        );
        console.error(
          "Example with missing fields:",
          JSON.stringify(missingAfterTransform[0], null, 2)
        );
        throw new Error(
          `After transformation, ${missingAfterTransform.length} participants have missing required fields`
        );
      }

      console.log(
        "Calling bulkCreateParticipants with",
        transformedData.length,
        "participants"
      );
      const result = await bulkCreateParticipants.mutateAsync(transformedData);
      console.log("Import result:", JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(result.error || "Failed to import participants");
      }

      toast.success(`Successfully imported ${data.length} participants`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import participants",
        { id: toastId }
      );
    } finally {
      onSetIsLoading(false);
    }
  };

  const handleEdit = (participant: Participant) => {
    onSetEditingParticipant(participant);
    onSetIsOpen(true);
  };

  const handleDelete = async (participant: Participant) => {
    try {
      const result = await deleteParticipant.mutateAsync({
        id: participant.id,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to delete participant");
      }

      toast.success("Participant deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  const handleAdd = () => {
    onSetEditingParticipant(null);
    onSetIsOpen(true);
  };

  return {
    handleSubmit,
    handleImportParticipants,
    handleEdit,
    handleDelete,
    handleAdd,
  };
}
