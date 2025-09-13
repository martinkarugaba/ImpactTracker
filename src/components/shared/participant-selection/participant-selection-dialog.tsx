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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, X } from "lucide-react";

export interface ParticipantSelectionContext {
  cluster_id: string;
  project_id?: string;
  organization_id?: string;
}

export interface ParticipantSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParticipantsSelected: (participants: Participant[]) => Promise<void>;
  context: ParticipantSelectionContext;
  title?: string;
  description?: string;
  allowCreateNew?: boolean;
  maxSelection?: number;
}

export function ParticipantSelectionDialog({
  open,
  onOpenChange,
  onParticipantsSelected,
  context,
  title = "Add Participants",
  description = "Search existing participants from your database first. If the participant doesn't exist, you can create a new one.",
  allowCreateNew = true,
  maxSelection,
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch existing participants
  const {
    data: participantsResponse,
    isLoading: loadingParticipants,
    isFetching: fetchingParticipants,
  } = useParticipants(context.cluster_id, {
    limit: 50,
    search: debouncedSearchTerm,
  });

  const availableParticipants = participantsResponse?.data?.data || [];

  // Fetch projects for the form
  const { data: projectsResponse } = useQuery({
    queryKey: ["projects", context.cluster_id],
    queryFn: () => getProjects(),
    enabled: !!context.cluster_id,
  });

  const projects = projectsResponse?.success ? projectsResponse.data || [] : [];
  const createParticipant = useCreateParticipant();

  const handleParticipantToggle = (
    participant: Participant,
    checked: boolean
  ) => {
    if (checked) {
      if (maxSelection && selectedParticipants.length >= maxSelection) {
        toast.error(`You can only select up to ${maxSelection} participants`);
        return;
      }
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
            {showCreateForm ? "Create New Participant" : title}
          </DialogTitle>
          <DialogDescription>
            {showCreateForm
              ? "Fill in the details to create a new participant."
              : description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {showCreateForm ? (
            <div className="h-full overflow-y-auto">
              <ParticipantForm
                onSubmit={handleCreateParticipant}
                isLoading={createParticipant.isPending}
                projects={projects}
                clusterId={context.cluster_id}
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
                  project_id: context.project_id || "",
                  cluster_id: context.cluster_id,
                  organization_id: context.organization_id || "",
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
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search participants by name or contact..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm !== debouncedSearchTerm && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    </div>
                  )}
                </div>

                {selectedParticipants.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      Selected ({selectedParticipants.length}
                      {maxSelection ? `/${maxSelection}` : ""}):
                    </span>
                    {selectedParticipants.map(participant => (
                      <Badge
                        key={participant.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {participant.firstName} {participant.lastName}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() =>
                            handleParticipantToggle(participant, false)
                          }
                        />
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
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
                    {allowCreateNew && (
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
                  <div className="h-full overflow-y-auto p-4">
                    {loadingParticipants ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                          <p className="text-muted-foreground text-sm">
                            Loading participants...
                          </p>
                        </div>
                      </div>
                    ) : availableParticipants.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Users className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                          <p className="text-muted-foreground text-sm">
                            {debouncedSearchTerm
                              ? "No participants found"
                              : "No participants available"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableParticipants.map(participant => (
                          <div
                            key={participant.id}
                            className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3"
                          >
                            <Checkbox
                              checked={selectedParticipants.some(
                                p => p.id === participant.id
                              )}
                              onCheckedChange={checked =>
                                handleParticipantToggle(participant, !!checked)
                              }
                              disabled={
                                !!maxSelection &&
                                selectedParticipants.length >= maxSelection &&
                                !selectedParticipants.some(
                                  p => p.id === participant.id
                                )
                              }
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {participant.firstName} {participant.lastName}
                                </span>
                                <Badge
                                  variant={
                                    participant.isActive === "yes"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="capitalize"
                                >
                                  {participant.isActive === "yes"
                                    ? "active"
                                    : "inactive"}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                <span>{participant.contact}</span>
                                <span>{participant.sex}</span>
                                {participant.age && (
                                  <span>{participant.age} years old</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {fetchingParticipants && !loadingParticipants && (
                      <div className="flex justify-center py-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      </div>
                    )}
                  </div>
                )}

                {!showCreateForm &&
                  availableParticipants.length > 0 &&
                  allowCreateNew && (
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
