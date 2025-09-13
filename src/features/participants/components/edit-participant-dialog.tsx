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
import { ParticipantForm } from "./participant-form";
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
}

export function EditParticipantDialog({
  participant,
  onSuccess,
  trigger,
}: EditParticipantDialogProps) {
  const [open, setOpen] = useState(false);
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
        // New demographic fields with defaults
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

      <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
          <DialogDescription>
            Update {participant.firstName} {participant.lastName}&apos;s
            information below.
          </DialogDescription>
        </DialogHeader>

        <ParticipantForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={updateParticipant.isPending}
          projects={projects}
          clusterId={participant.cluster_id}
        />
      </DialogContent>
    </Dialog>
  );
}
