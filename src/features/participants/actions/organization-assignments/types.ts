export interface AssignmentResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: {
    organizationName: string;
    assignmentMethod: "subcounty" | "parish";
    totalSubCounties: number;
    totalParticipantsFound: number;
    totalParticipantsUpdated: number;
    results: Array<{
      subCounty: string;
      participantsFound: number;
      participantsUpdated: number;
    }>;
  };
}

export interface PreviewResult {
  success: boolean;
  data?: {
    participantsToUpdate: Array<{
      id: string;
      firstName: string;
      lastName: string;
      subCounty: string;
      currentOrganization: string | null;
      suggestedOrganization: string;
    }>;
    summary: {
      totalParticipants: number;
      totalToUpdate: number;
      organizationChanges: Record<string, number>;
    };
  };
  error?: string;
}

export interface ParticipantData {
  id: string;
  firstName: string;
  lastName: string;
  subCounty: string;
  parish: string;
  organization_id: string | null;
}
