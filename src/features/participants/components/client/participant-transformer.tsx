import { type ParticipantFormValues } from "../participant-form";
import { type ParticipantSubmitData } from "./types";

/**
 * Transform participant form data for API submission
 */
export function transformParticipantData(
  formData: ParticipantSubmitData,
  clusterId: string
) {
  return {
    ...formData,
    cluster_id: clusterId,
    age: formData.age ? parseInt(formData.age, 10) : undefined,
    dateOfBirth: formData.dateOfBirth || undefined,
    noOfTrainings: parseInt(formData.noOfTrainings || "0", 10) || 0,
    numberOfChildren: parseInt(formData.numberOfChildren || "0", 10) || 0,
    monthlyIncome: parseInt(formData.monthlyIncome || "0", 10) || 0,
    isActive: formData.isActive === "yes",
    isPermanentResident: formData.isPermanentResident === "yes",
    areParentsAlive: formData.areParentsAlive === "yes",
    isPWD: formData.isPWD === "yes",
    isMother: formData.isMother === "yes",
    isRefugee: formData.isRefugee === "yes",
    isWillingToParticipate: formData.isWillingToParticipate === "yes",
  };
}

/**
 * Transform imported participant data for bulk creation
 */
export function transformImportData(
  data: ParticipantFormValues[],
  clusterId: string
) {
  return data.map(participant => ({
    firstName: participant.firstName,
    lastName: participant.lastName,
    country: participant.country,
    district: participant.district,
    subCounty: participant.subCounty,
    parish: participant.parish,
    village: participant.village,
    contact: participant.contact,
    designation: participant.designation,
    enterprise: participant.enterprise,
    employmentStatus: participant.employmentStatus,
    cluster_id: clusterId,
    project_id: participant.project_id,
    organization_id: participant.organization_id,
    sex: participant.sex as "male" | "female" | "other",
    age: participant.age,
    noOfTrainings: participant.noOfTrainings || "0",
    numberOfChildren: participant.numberOfChildren || "0",
    monthlyIncome: participant.monthlyIncome || "0",
    isPWD: (participant.isPWD === "yes" ? "yes" : "no") as "yes" | "no",
    isMother: (participant.isMother === "yes" ? "yes" : "no") as "yes" | "no",
    isRefugee: (participant.isRefugee === "yes" ? "yes" : "no") as "yes" | "no",
    isActive: (participant.isActive === "yes" ? "yes" : "no") as "yes" | "no",
    isPermanentResident: (participant.isPermanentResident === "yes"
      ? "yes"
      : "no") as "yes" | "no",
    areParentsAlive: (participant.areParentsAlive === "yes" ? "yes" : "no") as
      | "yes"
      | "no",
    mainChallenge: participant.mainChallenge || undefined,
    skillOfInterest: participant.skillOfInterest || undefined,
    expectedImpact: participant.expectedImpact || undefined,
    isWillingToParticipate: (participant.isWillingToParticipate === "yes"
      ? "yes"
      : "no") as "yes" | "no",
  }));
}

/**
 * Extract clusters organization data in the format needed by components
 */
export function extractClusterOrganizations(
  clusterId: string,
  clusters: {
    id: string;
    name: string;
    organizations?: { id: string; name: string }[];
  }[]
) {
  const currentCluster = clusters.find(c => c.id === clusterId);

  return (
    currentCluster?.organizations?.map(org => ({
      id: org.id,
      name: org.name,
      acronym: org.name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase(),
      cluster_id: clusterId,
      project_id: null,
      country: "",
      district: "",
      sub_county_id: "",
      operation_sub_counties: [],
      parish: "",
      village: "",
      address: "",
      created_at: null,
      updated_at: null,
      cluster: currentCluster
        ? {
            id: currentCluster.id,
            name: currentCluster.name,
          }
        : null,
      project: null,
    })) || []
  );
}
