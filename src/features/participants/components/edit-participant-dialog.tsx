"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { MultiStepParticipantForm } from "./multi-step-participant-form";
import { useUpdateParticipant } from "../hooks/use-participants";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/features/projects/actions/projects";
import { type Project } from "@/features/projects/types";
import { type Participant } from "../types/types";
import { type ParticipantFormValues } from "./participant-form";
import toast from "react-hot-toast";

interface EditParticipantDialogProps {
  participant: Participant;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditParticipantDialog({
  participant,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: EditParticipantDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const updateParticipant = useUpdateParticipant();

  // Fetch projects for the form
  const { data: projectsResponse } = useQuery({
    queryKey: ["projects", participant.cluster_id],
    queryFn: () => getProjects(),
  });

  const projects: Project[] = projectsResponse?.success
    ? projectsResponse.data || []
    : [];

  const handleSubmit = async (data: ParticipantFormValues) => {
    try {
      const updateData = {
        ...data,
        age: data.age ? parseInt(data.age) : null,
        noOfTrainings: parseInt(data.noOfTrainings),
        numberOfChildren: parseInt(data.numberOfChildren),
        monthlyIncome: parseInt(data.monthlyIncome),
        // Handle dateOfBirth conversion from string to Date or null
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        // Handle optional fields that can be null or undefined
        mainChallenge: data.mainChallenge || null,
        skillOfInterest: data.skillOfInterest || null,
        expectedImpact: data.expectedImpact || null,
        // Handle new optional fields properly
        maritalStatus: data.maritalStatus || null,
        educationLevel: data.educationLevel || null,
        sourceOfIncome: data.sourceOfIncome || null,
        populationSegment: data.populationSegment || null,
        refugeeLocation: data.refugeeLocation || null,
        vslaName: data.vslaName || null,
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
      };

      const result = await updateParticipant.mutateAsync({
        id: participant.id,
        data: updateData,
      });

      if (result.success) {
        toast.success("Participant updated successfully");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update participant");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating participant:", error);
    }
  };

  // Convert participant data to form values
  const initialData: ParticipantFormValues = {
    firstName: participant.firstName,
    lastName: participant.lastName,
    country: participant.country,
    district: participant.district,
    subCounty: participant.subCounty,
    parish: participant.parish,
    village: participant.village,
    sex: participant.sex as "male" | "female" | "other",
    age: participant.age ? participant.age.toString() : undefined,
    dateOfBirth: participant.dateOfBirth
      ? participant.dateOfBirth.toISOString().split("T")[0]
      : undefined,
    isPWD: participant.isPWD as "yes" | "no",
    isMother: participant.isMother as "yes" | "no",
    isRefugee: participant.isRefugee as "yes" | "no",
    designation: participant.designation,
    enterprise: participant.enterprise,
    contact: participant.contact,
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
    // Financial inclusion fields - using defaults if not present in participant data
    accessedLoans: "no" as "yes" | "no",
    individualSaving: "no" as "yes" | "no",
    groupSaving: "no" as "yes" | "no",
    // Employment tracking fields - using empty strings as defaults
    wageEmploymentStatus: "",
    wageEmploymentSector: "",
    wageEmploymentScale: "",
    selfEmploymentStatus: "",
    selfEmploymentSector: "",
    businessScale: "",
    secondaryEmploymentStatus: "",
    secondaryEmploymentSector: "",
    secondaryBusinessScale: "",
    // Location and disability fields
    locationSetting: "rural" as "urban" | "rural",
    disabilityType: "",

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
    isSubscribedToVSLA: "no" as "yes" | "no",
    vslaName: undefined,

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
    // Location IDs (when available from participant data)
    country_id: participant.country_id || undefined,
    district_id: participant.district_id || undefined,
    subcounty_id: participant.subcounty_id || undefined,
    parish_id: participant.parish_id || undefined,
    village_id: participant.village_id || undefined,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Participant
        </Button>
      )}

      <DialogContent className="max-h-[95vh] w-[98vw] max-w-6xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Participant
          </DialogTitle>
          <DialogDescription className="text-base">
            Update {participant.firstName} {participant.lastName}&apos;s
            information using the step-by-step form below.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(95vh-120px)] overflow-y-auto">
          <MultiStepParticipantForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={updateParticipant.isPending}
            projects={projects}
            clusterId={participant.cluster_id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
