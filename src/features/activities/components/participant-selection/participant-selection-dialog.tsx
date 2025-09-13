"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  useParticipants,
  useCreateParticipant,
} from "@/features/participants/hooks/use-participants";
import {
  type Participant,
  type NewParticipant,
} from "@/features/participants/types/types";
import {
  type ParticipantFormValues,
  ParticipantForm,
} from "@/features/participants/components/participant-form";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/features/projects/actions/projects";
import toast from "react-hot-toast";

import { ParticipantSearchForm } from "./participant-search-form";
import { SelectedParticipantsSection } from "./selected-participants-section";
import { ParticipantList } from "./participant-list";
import { type ParticipantSelectionDialogProps } from "./types";

export function ParticipantSelectionDialog({
  open,
  onOpenChange,
  onParticipantsSelected,
  activity,
}: ParticipantSelectionDialogProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search term to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch existing participants from the database with server-side search
  const {
    data: participantsResponse,
    isLoading: loadingParticipants,
    isFetching: fetchingParticipants,
  } = useParticipants(activity?.cluster_id || "", {
    limit: 50, // Reduce limit since we're using server-side search
    search: debouncedSearchTerm, // Pass search term to server
  });

  const availableParticipants = participantsResponse?.data?.data || [];

  // Fetch projects for the form
  const { data: projectsResponse } = useQuery({
    queryKey: ["projects", activity?.cluster_id],
    queryFn: () => getProjects(),
    enabled: !!activity?.cluster_id,
  });

  const projects = projectsResponse?.success ? projectsResponse.data || [] : [];
  const createParticipant = useCreateParticipant();

  const handleParticipantToggle = (
    participant: Participant,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedParticipants(prev => [...prev, participant]);
    } else {
      setSelectedParticipants(prev =>
        prev.filter(p => p.id !== participant.id)
      );
    }
  };

  const handleClearAll = () => {
    setSelectedParticipants([]);
  };

  const handleAddSelected = async () => {
    setIsSubmitting(true);
    try {
      await onParticipantsSelected(selectedParticipants);
      setSelectedParticipants([]);
      setSearchTerm("");
      setShowCreateForm(false);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateParticipant = async (data: ParticipantFormValues) => {
    if (!activity) return;

    try {
      const newParticipantData: NewParticipant = {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        district: data.district,
        subCounty: data.subCounty,
        parish: data.parish,
        village: data.village,
        sex: data.sex,
        age: data.age ? parseInt(data.age) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        isPWD: data.isPWD,
        disabilityType: null, // New demographic field
        isMother: data.isMother,
        isRefugee: data.isRefugee,
        designation: data.designation,
        enterprise: data.enterprise,
        contact: data.contact,
        project_id: data.project_id,
        cluster_id: data.cluster_id,
        organization_id: data.organization_id,
        noOfTrainings: parseInt(data.noOfTrainings),
        isActive: data.isActive,
        isPermanentResident: data.isPermanentResident,
        areParentsAlive: data.areParentsAlive,
        numberOfChildren: parseInt(data.numberOfChildren),
        employmentStatus: data.employmentStatus,
        monthlyIncome: parseInt(data.monthlyIncome) || 0,
        // New employment tracking fields with defaults
        wageEmploymentStatus: null,
        wageEmploymentSector: null,
        wageEmploymentScale: null,
        selfEmploymentStatus: null,
        selfEmploymentSector: null,
        businessScale: null,
        secondaryEmploymentStatus: null,
        secondaryEmploymentSector: null,
        secondaryBusinessScale: null,
        // Financial inclusion fields
        accessedLoans: "no",
        individualSaving: "no",
        groupSaving: "no",
        // Location classification
        locationSetting: null,
        mainChallenge: data.mainChallenge || null,
        skillOfInterest: data.skillOfInterest || null,
        expectedImpact: data.expectedImpact || null,
        isWillingToParticipate: data.isWillingToParticipate,
      };

      const result = await createParticipant.mutateAsync(newParticipantData);

      if (result.success && result.data) {
        toast.success("Participant created successfully");
        onParticipantsSelected([result.data]);
        setShowCreateForm(false);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to create participant");
      }
    } catch (error) {
      console.error("Error creating participant:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const noResultsFound =
    availableParticipants.length === 0 &&
    debouncedSearchTerm.length > 0 &&
    !loadingParticipants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {showCreateForm ? "Create New Participant" : "Add Participants"}
          </DialogTitle>
          <DialogDescription>
            {showCreateForm
              ? "Fill in the details to create a new participant."
              : "Search existing participants from your database first. If the participant doesn't exist, you can create a new one."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {showCreateForm ? (
            <div className="h-full overflow-y-auto">
              <ParticipantForm
                onSubmit={handleCreateParticipant}
                isLoading={createParticipant.isPending}
                projects={projects}
                clusterId={activity?.cluster_id}
                initialData={{
                  firstName: "",
                  lastName: "",
                  country: "Uganda",
                  district: "",
                  subCounty: "",
                  parish: "",
                  village: "",
                  sex: "female",
                  age: "",
                  dateOfBirth: "",
                  isPWD: "no",
                  isMother: "no",
                  isRefugee: "no",
                  designation: "",
                  enterprise: "",
                  contact: "",
                  project_id: activity?.project_id || "",
                  cluster_id: activity?.cluster_id || "",
                  organization_id: activity?.organization_id || "",
                  noOfTrainings: "0",
                  isActive: "yes",
                  isPermanentResident: "yes",
                  areParentsAlive: "yes",
                  numberOfChildren: "0",
                  employmentStatus: "",
                  monthlyIncome: "",
                  mainChallenge: "",
                  skillOfInterest: "",
                  expectedImpact: "",
                  isWillingToParticipate: "yes",
                  accessedLoans: "no",
                  individualSaving: "no",
                  groupSaving: "no",
                }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Back to Search
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col space-y-4">
              <div className="flex-shrink-0 space-y-4">
                <ParticipantSearchForm
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  isSearching={searchTerm !== debouncedSearchTerm}
                />

                <SelectedParticipantsSection
                  selectedParticipants={selectedParticipants}
                  onClearAll={handleClearAll}
                />
              </div>

              <div className="flex-1 overflow-hidden rounded-md border">
                {noResultsFound ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <UserPlus className="text-muted-foreground h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        No participants found
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        No participants match "{debouncedSearchTerm}". Try a
                        different search term.
                      </p>
                    </div>
                    {activity && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Create New Participant
                      </Button>
                    )}
                  </div>
                ) : (
                  <ParticipantList
                    participants={availableParticipants}
                    selectedParticipants={selectedParticipants}
                    onParticipantToggle={handleParticipantToggle}
                    isLoading={loadingParticipants}
                    isFetching={fetchingParticipants}
                  />
                )}

                {!showCreateForm &&
                  availableParticipants.length > 0 &&
                  activity && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Create New Participant Instead
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
        {!showCreateForm && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedParticipants.length === 0 || isSubmitting}
            >
              Add {selectedParticipants.length} Participant
              {selectedParticipants.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
