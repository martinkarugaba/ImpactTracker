"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ImportParticipants } from "../import/import-participants";
import {
  MultiStepParticipantForm,
  type ParticipantFormValues,
} from "../multi-step-participant-form";
import { type Participant } from "../../types/types";
import {
  useCreateParticipant,
  useUpdateParticipant,
  useDeleteParticipant,
} from "../../hooks/use-participants";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/features/projects/actions/projects";
import { type Project } from "@/features/projects/types";
import toast from "react-hot-toast";

interface ParticipantDialogsProps {
  clusterId: string;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: (open: boolean) => void;
  editingParticipant: Participant | null;
  setEditingParticipant: (participant: Participant | null) => void;
  deletingParticipant: Participant | null;
  setDeletingParticipant: (participant: Participant | null) => void;
  onSuccess?: () => void;
}

export function ParticipantDialogs({
  clusterId,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isImportDialogOpen,
  setIsImportDialogOpen,
  editingParticipant,
  setEditingParticipant,
  deletingParticipant,
  setDeletingParticipant,
  onSuccess,
}: ParticipantDialogsProps) {
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const deleteParticipant = useDeleteParticipant(clusterId);

  // Fetch projects for the form
  const { data: projectsResponse } = useQuery({
    queryKey: ["projects", clusterId],
    queryFn: () => getProjects(),
  });

  const projects: Project[] = projectsResponse?.success
    ? projectsResponse.data || []
    : [];

  const handleCreateSubmit = async (data: ParticipantFormValues) => {
    try {
      const {
        country,
        district,
        subCounty,
        parish,
        village,
        designation,
        enterprise,
        age,
        ...restData
      } = data;
      const createData = {
        ...restData,
        // Convert undefined to null for database compatibility
        country: country || null,
        district: district || null,
        subCounty: subCounty || null,
        parish: parish || null,
        village: village || null,
        designation: designation || null,
        enterprise: enterprise || null,
        age: age ? parseInt(age) : null,
        noOfTrainings: parseInt(data.noOfTrainings),
        numberOfChildren: parseInt(data.numberOfChildren),
        monthlyIncome: parseInt(data.monthlyIncome),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        mainChallenge: data.mainChallenge || null,
        skillOfInterest: data.skillOfInterest || null,
        expectedImpact: data.expectedImpact || null,
        // Handle new optional enum fields properly
        maritalStatus: data.maritalStatus || null,
        educationLevel: data.educationLevel || null,
        sourceOfIncome: data.sourceOfIncome || null,
        populationSegment: data.populationSegment || null,
        refugeeLocation: data.refugeeLocation || null,
        vslaId: data.vslaId || null,
        enterpriseName: data.enterpriseName || null,
        enterpriseSector: data.enterpriseSector || null,
        enterpriseSize: data.enterpriseSize || null,
        employmentType: data.employmentType || null,
        employmentSector: data.employmentSector || null,
        // Convert string numeric fields to numbers
        enterpriseYouthMale: parseInt(data.enterpriseYouthMale),
        enterpriseYouthFemale: parseInt(data.enterpriseYouthFemale),
        enterpriseAdults: parseInt(data.enterpriseAdults),
        vocationalSkillsParticipations: Array.isArray(
          data.vocationalSkillsParticipations
        )
          ? data.vocationalSkillsParticipations
          : [],
        vocationalSkillsCompletions: Array.isArray(
          data.vocationalSkillsCompletions
        )
          ? data.vocationalSkillsCompletions
          : [],
        vocationalSkillsCertifications: Array.isArray(
          data.vocationalSkillsCertifications
        )
          ? data.vocationalSkillsCertifications
          : [],
        softSkillsParticipations: Array.isArray(data.softSkillsParticipations)
          ? data.softSkillsParticipations
          : [],
        softSkillsCompletions: Array.isArray(data.softSkillsCompletions)
          ? data.softSkillsCompletions
          : [],
        softSkillsCertifications: Array.isArray(data.softSkillsCertifications)
          ? data.softSkillsCertifications
          : [],
        // Legacy fields with defaults
        disabilityType: null,
        wageEmploymentStatus: null,
        wageEmploymentSector: null,
        wageEmploymentScale: null,
        selfEmploymentStatus: null,
        selfEmploymentSector: null,
        businessScale: null,
        secondaryEmploymentStatus: null,
        secondaryEmploymentSector: null,
        secondaryBusinessScale: null,
        accessedLoans: "no",
        individualSaving: "no",
        groupSaving: "no",
        locationSetting: null,
        // Location IDs (convert undefined to null)
        country_id: data.country_id || null,
        district_id: data.district_id || null,
        subcounty_id: data.subcounty_id || null,
        parish_id: data.parish_id || null,
        village_id: data.village_id || null,
        // Legacy VSLA fields for backward compatibility
        isSubscribedToVSLA: data.vslaId ? "yes" : "no",
        vslaName: data.vslaId || "",
        // Contact is now optional in both form and database
        contact: data.contact || null,
      };

      const result = await createParticipant.mutateAsync(createData);

      if (result.success) {
        toast.success("Participant created successfully");
        setIsCreateDialogOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create participant");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error creating participant:", error);
    }
  };

  const handleUpdateSubmit = async (data: ParticipantFormValues) => {
    if (!editingParticipant) return;

    try {
      const {
        country,
        district,
        subCounty,
        parish,
        village,
        designation,
        enterprise,
        age,
        ...restData
      } = data;
      const updateData = {
        ...restData,
        // Convert undefined to null for database compatibility
        country: country || null,
        district: district || null,
        subCounty: subCounty || null,
        parish: parish || null,
        village: village || null,
        designation: designation || null,
        enterprise: enterprise || null,
        age: age ? parseInt(age) : null,
        noOfTrainings: parseInt(data.noOfTrainings),
        numberOfChildren: parseInt(data.numberOfChildren),
        monthlyIncome: parseInt(data.monthlyIncome),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        mainChallenge: data.mainChallenge || null,
        skillOfInterest: data.skillOfInterest || null,
        expectedImpact: data.expectedImpact || null,
        // Handle new optional enum fields properly
        maritalStatus: data.maritalStatus || null,
        educationLevel: data.educationLevel || null,
        sourceOfIncome: data.sourceOfIncome || null,
        populationSegment: data.populationSegment || null,
        refugeeLocation: data.refugeeLocation || null,
        vslaId: data.vslaId || null,
        enterpriseName: data.enterpriseName || null,
        enterpriseSector: data.enterpriseSector || null,
        enterpriseSize: data.enterpriseSize || null,
        employmentType: data.employmentType || null,
        employmentSector: data.employmentSector || null,
        // Convert string numeric fields to numbers
        enterpriseYouthMale: parseInt(data.enterpriseYouthMale),
        enterpriseYouthFemale: parseInt(data.enterpriseYouthFemale),
        enterpriseAdults: parseInt(data.enterpriseAdults),
        vocationalSkillsParticipations: Array.isArray(
          data.vocationalSkillsParticipations
        )
          ? data.vocationalSkillsParticipations
          : [],
        vocationalSkillsCompletions: Array.isArray(
          data.vocationalSkillsCompletions
        )
          ? data.vocationalSkillsCompletions
          : [],
        vocationalSkillsCertifications: Array.isArray(
          data.vocationalSkillsCertifications
        )
          ? data.vocationalSkillsCertifications
          : [],
        softSkillsParticipations: Array.isArray(data.softSkillsParticipations)
          ? data.softSkillsParticipations
          : [],
        softSkillsCompletions: Array.isArray(data.softSkillsCompletions)
          ? data.softSkillsCompletions
          : [],
        softSkillsCertifications: Array.isArray(data.softSkillsCertifications)
          ? data.softSkillsCertifications
          : [],
        // Legacy fields with defaults
        disabilityType: null,
        wageEmploymentStatus: null,
        wageEmploymentSector: null,
        wageEmploymentScale: null,
        selfEmploymentStatus: null,
        selfEmploymentSector: null,
        businessScale: null,
        secondaryEmploymentStatus: null,
        secondaryEmploymentSector: null,
        secondaryBusinessScale: null,
        accessedLoans: "no",
        individualSaving: "no",
        groupSaving: "no",
        locationSetting: null,
        // Location IDs (convert undefined to null)
        country_id: data.country_id || null,
        district_id: data.district_id || null,
        subcounty_id: data.subcounty_id || null,
        parish_id: data.parish_id || null,
        village_id: data.village_id || null,
        // Legacy VSLA fields for backward compatibility
        isSubscribedToVSLA: data.vslaId ? "yes" : "no",
        vslaName: data.vslaId || "",
        // Contact is now optional in both form and database
        contact: data.contact || null,
      };

      const result = await updateParticipant.mutateAsync({
        id: editingParticipant.id,
        data: updateData,
      });

      if (result.success) {
        toast.success("Participant updated successfully");
        setEditingParticipant(null);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update participant");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating participant:", error);
    }
  };

  // Convert participant data to form values for editing
  const getEditFormData = (
    participant: Participant
  ): ParticipantFormValues => ({
    firstName: participant.firstName,
    lastName: participant.lastName,
    country: participant.country || undefined,
    district: participant.district || undefined,
    subCounty: participant.subCounty || undefined,
    parish: participant.parish || undefined,
    village: participant.village || undefined,
    sex: participant.sex as "male" | "female" | "other",
    age: participant.age ? participant.age.toString() : undefined,
    dateOfBirth: participant.dateOfBirth
      ? participant.dateOfBirth.toISOString().split("T")[0]
      : undefined,
    isPWD: participant.isPWD as "yes" | "no",
    isMother: participant.isMother as "yes" | "no",
    isRefugee: participant.isRefugee as "yes" | "no",
    designation: participant.designation || undefined,
    enterprise: participant.enterprise || undefined,
    contact: participant.contact || undefined,
    project_id: participant.project_id,
    cluster_id: participant.cluster_id,
    organization_id: participant.organization_id,
    noOfTrainings: participant.noOfTrainings.toString(),
    isActive: participant.isActive as "yes" | "no",
    employmentStatus: participant.employmentStatus,
    isPermanentResident: participant.isPermanentResident as "yes" | "no",
    areParentsAlive: participant.areParentsAlive as "yes" | "no",
    numberOfChildren: participant.numberOfChildren.toString(),
    monthlyIncome: participant.monthlyIncome.toString(),
    mainChallenge: participant.mainChallenge || "",
    skillOfInterest: participant.skillOfInterest || "",
    expectedImpact: participant.expectedImpact || "",
    isWillingToParticipate: participant.isWillingToParticipate as "yes" | "no",
    accessedLoans: "no" as const,
    individualSaving: "no" as const,
    groupSaving: "no" as const,

    // NEW FIELDS with defaults
    // Personal Information
    maritalStatus: undefined,
    educationLevel: undefined,
    sourceOfIncome: undefined,
    nationality: "Ugandan",
    populationSegment: undefined,
    refugeeLocation: undefined,
    isActiveStudent: "no" as "yes" | "no",

    // VSLA Information
    vslaId: undefined,

    // Teen Mother
    isTeenMother: "no" as "yes" | "no",

    // Enterprise Information
    ownsEnterprise: "no" as "yes" | "no",
    enterpriseName: undefined,
    enterpriseSector: undefined,
    enterpriseSize: undefined,
    enterpriseYouthMale: "0",
    enterpriseYouthFemale: "0",
    enterpriseAdults: "0",

    // Skills Information
    hasVocationalSkills: "no" as "yes" | "no",
    vocationalSkillsParticipations: [],
    vocationalSkillsCompletions: [],
    vocationalSkillsCertifications: [],

    hasSoftSkills: "no" as "yes" | "no",
    softSkillsParticipations: [],
    softSkillsCompletions: [],
    softSkillsCertifications: [],

    hasBusinessSkills: "no" as "yes" | "no",

    // Employment Details
    employmentType: undefined,
    employmentSector: undefined,
  });
  const confirmDelete = async () => {
    if (!deletingParticipant) return;

    try {
      const result = await deleteParticipant.mutateAsync({
        id: deletingParticipant.id,
      });

      if (result.success) {
        toast.success("Participant deleted successfully.");
        setDeletingParticipant(null);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to delete participant.");
      }
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast.error("Failed to delete participant. Please try again.");
    }
  };

  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingParticipant}
        onOpenChange={open => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingParticipant(null);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-hidden"
          style={{ width: "90vw", maxWidth: "1000px", minWidth: "800px" }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingParticipant ? "Edit Participant" : "Add New Participant"}
            </DialogTitle>
            <DialogDescription>
              {editingParticipant
                ? `Update ${editingParticipant.firstName} ${editingParticipant.lastName}'s information below.`
                : "Fill in the participant details below."}
            </DialogDescription>
          </DialogHeader>

          <div
            className="overflow-x-hidden overflow-y-auto pr-2"
            style={{ maxHeight: "calc(90vh - 120px)" }}
          >
            <MultiStepParticipantForm
              initialData={
                editingParticipant
                  ? getEditFormData(editingParticipant)
                  : undefined
              }
              onSubmit={
                editingParticipant ? handleUpdateSubmit : handleCreateSubmit
              }
              isLoading={
                editingParticipant
                  ? updateParticipant.isPending
                  : createParticipant.isPending
              }
              projects={projects}
              clusterId={clusterId}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Participants</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import multiple participants at once.
            </DialogDescription>
          </DialogHeader>
          <ImportParticipants
            clusterId={clusterId}
            onImportComplete={async () => {
              setIsImportDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingParticipant}
        onOpenChange={open => {
          if (!open) setDeletingParticipant(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              participant "{deletingParticipant?.firstName}{" "}
              {deletingParticipant?.lastName}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
