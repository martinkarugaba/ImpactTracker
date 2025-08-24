"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Project } from "@/features/projects/types";
import { type Participant } from "../../types/types";
import { type ParticipantFormValues } from "../participant-form";
import { ParticipantForm } from "../participant-form";
import { Separator } from "@/components/ui/separator";

// Extended participant type with the additional properties needed for the form
type ExtendedParticipant = Participant & {
  noOfTrainings?: string | number;
  isActive?: string;
  organization_id?: string;
};

interface AddParticipantDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingParticipant: ExtendedParticipant | null;
  handleSubmit: (data: ParticipantFormValues) => Promise<void>;
  isLoading: boolean;
  projects: Project[];
  clusters: { id: string; name: string }[];
  children?: React.ReactNode;
}

export function AddParticipantDialog({
  isOpen,
  setIsOpen,
  editingParticipant,
  handleSubmit,
  isLoading,
  projects,
  clusters,
  children,
}: AddParticipantDialogProps) {
  const handleOpenDialog = () => setIsOpen(true);

  // Transform the participant data to match the form's expected types
  const transformedData = editingParticipant
    ? {
        firstName: editingParticipant.firstName,
        lastName: editingParticipant.lastName,
        country: editingParticipant.country,
        district: editingParticipant.district,
        subCounty: editingParticipant.subCounty,
        parish: editingParticipant.parish,
        village: editingParticipant.village,
        sex: editingParticipant.sex as "male" | "female" | "other",
        age: editingParticipant.age.toString(),
        isPWD: editingParticipant.isPWD as "yes" | "no",
        isMother: editingParticipant.isMother as "yes" | "no",
        isRefugee: editingParticipant.isRefugee as "yes" | "no",
        designation: editingParticipant.designation,
        enterprise: editingParticipant.enterprise,
        contact: editingParticipant.contact,
        organization_id: editingParticipant.organization_id || "",
        project_id: editingParticipant.project_id,
        cluster_id: editingParticipant.cluster_id || clusters[0]?.id || "",
        isPermanentResident: (editingParticipant.isPermanentResident ||
          "yes") as "yes" | "no",
        areParentsAlive: (editingParticipant.areParentsAlive || "yes") as
          | "yes"
          | "no",
        numberOfChildren:
          editingParticipant.numberOfChildren?.toString() || "0",
        employmentStatus: editingParticipant.employmentStatus || "unemployed",
        monthlyIncome: editingParticipant.monthlyIncome?.toString() || "0",
        mainChallenge: editingParticipant.mainChallenge || "",
        skillOfInterest: editingParticipant.skillOfInterest || "",
        expectedImpact: editingParticipant.expectedImpact || "",
        isWillingToParticipate: (editingParticipant.isWillingToParticipate ||
          "yes") as "yes" | "no",
        noOfTrainings: "0",
        isActive: "yes" as const,
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!editingParticipant && (
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <Button
              onClick={handleOpenDialog}
              className="flex items-center gap-2"
              variant="default"
            >
              <Plus className="h-3 w-4" />
              Add Participant
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] min-w-[80vw] overflow-auto lg:min-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {editingParticipant ? "Edit Participant" : "Add Participant"}
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <ParticipantForm
          initialData={transformedData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          projects={projects}
          clusterId={clusters[0]?.id}
        />
      </DialogContent>
    </Dialog>
  );
}
