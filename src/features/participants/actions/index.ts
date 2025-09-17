"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { participants, organizations, clusterMembers } from "@/lib/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import {
  type NewParticipant,
  type ParticipantResponse,
  type ParticipantsResponse,
} from "../types/types";
import { calculateAge, validateDateOfBirth } from "../lib/age-calculator";

export async function getParticipants(
  clusterId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      cluster?: string;
      project?: string;
      organization?: string;
      district?: string;
      subCounty?: string;
      enterprise?: string;
      sex?: string;
      isPWD?: string;
      ageGroup?: string;
      maritalStatus?: string;
      educationLevel?: string;
      isSubscribedToVSLA?: string;
      ownsEnterprise?: string;
      employmentType?: string;
      employmentSector?: string;
      hasVocationalSkills?: string;
      hasSoftSkills?: string;
      hasBusinessSkills?: string;
      specificVocationalSkill?: string;
      specificSoftSkill?: string;
      specificBusinessSkill?: string;
      populationSegment?: string;
      isActiveStudent?: string;
      isTeenMother?: string;
      sourceOfIncome?: string;
      enterpriseSector?: string;
      businessScale?: string;
      nationality?: string;
      locationSetting?: string;
      isRefugee?: string;
      isMother?: string;
    };
  }
): Promise<ParticipantsResponse> {
  try {
    console.log("🔍 getParticipants called with:", {
      clusterId,
      params,
    });

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [eq(participants.cluster_id, clusterId)];

    // Add filter conditions
    if (params?.filters) {
      console.log("📝 Processing filters:", params.filters);

      if (params.filters.project && params.filters.project !== "all") {
        console.log("Adding project filter:", params.filters.project);
        whereConditions.push(
          eq(participants.project_id, params.filters.project)
        );
      }
      if (
        params.filters.organization &&
        params.filters.organization !== "all"
      ) {
        console.log("Adding organization filter:", params.filters.organization);
        whereConditions.push(
          eq(participants.organization_id, params.filters.organization)
        );
      }
      if (params.filters.district && params.filters.district !== "all") {
        console.log("Adding district filter:", params.filters.district);
        whereConditions.push(
          eq(participants.district, params.filters.district)
        );
      }
      if (params.filters.subCounty && params.filters.subCounty !== "all") {
        console.log("Adding subCounty filter:", params.filters.subCounty);
        whereConditions.push(
          eq(participants.subCounty, params.filters.subCounty)
        );
      }
      if (params.filters.enterprise && params.filters.enterprise !== "all") {
        console.log("Adding enterprise filter:", params.filters.enterprise);
        whereConditions.push(
          eq(participants.enterprise, params.filters.enterprise)
        );
      }
      if (params.filters.sex && params.filters.sex !== "all") {
        console.log("Adding sex filter:", params.filters.sex);
        whereConditions.push(eq(participants.sex, params.filters.sex));
      }
      if (params.filters.isPWD && params.filters.isPWD !== "all") {
        console.log("Adding isPWD filter:", params.filters.isPWD);
        whereConditions.push(eq(participants.isPWD, params.filters.isPWD));
      }
      if (params.filters.ageGroup && params.filters.ageGroup !== "all") {
        console.log("Adding ageGroup filter:", params.filters.ageGroup);
        if (params.filters.ageGroup === "young") {
          console.log("Applying young filter: age >= 15 AND age <= 35");
          whereConditions.push(
            sql`${participants.age} >= 15 AND ${participants.age} <= 35`
          );
        } else if (params.filters.ageGroup === "adult") {
          console.log("Applying adult filter: age >= 36 AND age <= 59");
          whereConditions.push(
            sql`${participants.age} >= 36 AND ${participants.age} <= 59`
          );
        } else if (params.filters.ageGroup === "older") {
          console.log("Applying older filter: age >= 60");
          whereConditions.push(sql`${participants.age} >= 60`);
        }
      }

      // Additional filters for comprehensive participant filtering
      if (
        params.filters.maritalStatus &&
        params.filters.maritalStatus !== "all"
      ) {
        console.log(
          "Adding maritalStatus filter:",
          params.filters.maritalStatus
        );
        whereConditions.push(
          eq(participants.maritalStatus, params.filters.maritalStatus)
        );
      }
      if (
        params.filters.educationLevel &&
        params.filters.educationLevel !== "all"
      ) {
        console.log(
          "Adding educationLevel filter:",
          params.filters.educationLevel
        );
        whereConditions.push(
          eq(participants.educationLevel, params.filters.educationLevel)
        );
      }
      if (
        params.filters.isSubscribedToVSLA &&
        params.filters.isSubscribedToVSLA !== "all"
      ) {
        console.log(
          "Adding isSubscribedToVSLA filter:",
          params.filters.isSubscribedToVSLA
        );
        whereConditions.push(
          eq(participants.isSubscribedToVSLA, params.filters.isSubscribedToVSLA)
        );
      }
      if (
        params.filters.ownsEnterprise &&
        params.filters.ownsEnterprise !== "all"
      ) {
        console.log(
          "Adding ownsEnterprise filter:",
          params.filters.ownsEnterprise
        );
        whereConditions.push(
          eq(participants.ownsEnterprise, params.filters.ownsEnterprise)
        );
      }
      if (
        params.filters.employmentType &&
        params.filters.employmentType !== "all"
      ) {
        console.log(
          "Adding employmentType filter:",
          params.filters.employmentType
        );
        whereConditions.push(
          eq(participants.employmentType, params.filters.employmentType)
        );
      }
      if (
        params.filters.employmentSector &&
        params.filters.employmentSector !== "all"
      ) {
        console.log(
          "Adding employmentSector filter:",
          params.filters.employmentSector
        );
        whereConditions.push(
          eq(participants.employmentSector, params.filters.employmentSector)
        );
      }
      if (
        params.filters.hasVocationalSkills &&
        params.filters.hasVocationalSkills !== "all"
      ) {
        console.log(
          "Adding hasVocationalSkills filter:",
          params.filters.hasVocationalSkills
        );
        whereConditions.push(
          eq(
            participants.hasVocationalSkills,
            params.filters.hasVocationalSkills
          )
        );
      }
      if (
        params.filters.hasSoftSkills &&
        params.filters.hasSoftSkills !== "all"
      ) {
        console.log(
          "Adding hasSoftSkills filter:",
          params.filters.hasSoftSkills
        );
        whereConditions.push(
          eq(participants.hasSoftSkills, params.filters.hasSoftSkills)
        );
      }
      if (
        params.filters.hasBusinessSkills &&
        params.filters.hasBusinessSkills !== "all"
      ) {
        console.log(
          "Adding hasBusinessSkills filter:",
          params.filters.hasBusinessSkills
        );
        whereConditions.push(
          eq(participants.hasBusinessSkills, params.filters.hasBusinessSkills)
        );
      }

      // Specific skills filters
      if (
        params.filters.specificVocationalSkill &&
        params.filters.specificVocationalSkill !== "all"
      ) {
        console.log(
          "Adding specificVocationalSkill filter:",
          params.filters.specificVocationalSkill
        );
        whereConditions.push(
          sql`(
            ${participants.vocationalSkillsParticipations} && ARRAY[${params.filters.specificVocationalSkill}] OR
            ${participants.vocationalSkillsCompletions} && ARRAY[${params.filters.specificVocationalSkill}] OR
            ${participants.vocationalSkillsCertifications} && ARRAY[${params.filters.specificVocationalSkill}]
          )`
        );
      }
      if (
        params.filters.specificSoftSkill &&
        params.filters.specificSoftSkill !== "all"
      ) {
        console.log(
          "Adding specificSoftSkill filter:",
          params.filters.specificSoftSkill
        );
        whereConditions.push(
          sql`(
            ${participants.softSkillsParticipations} && ARRAY[${params.filters.specificSoftSkill}] OR
            ${participants.softSkillsCompletions} && ARRAY[${params.filters.specificSoftSkill}] OR
            ${participants.softSkillsCertifications} && ARRAY[${params.filters.specificSoftSkill}]
          )`
        );
      }
      if (
        params.filters.specificBusinessSkill &&
        params.filters.specificBusinessSkill !== "all"
      ) {
        console.log(
          "Adding specificBusinessSkill filter:",
          params.filters.specificBusinessSkill
        );
        // For business skills, we might need to check a different field or implement business skill tracking
        // For now, let's check if it's mentioned in vocational skills as well
        whereConditions.push(
          sql`(
            ${participants.vocationalSkillsParticipations} && ARRAY[${params.filters.specificBusinessSkill}] OR
            ${participants.vocationalSkillsCompletions} && ARRAY[${params.filters.specificBusinessSkill}] OR
            ${participants.vocationalSkillsCertifications} && ARRAY[${params.filters.specificBusinessSkill}]
          )`
        );
      }

      if (
        params.filters.populationSegment &&
        params.filters.populationSegment !== "all"
      ) {
        console.log(
          "Adding populationSegment filter:",
          params.filters.populationSegment
        );
        whereConditions.push(
          eq(participants.populationSegment, params.filters.populationSegment)
        );
      }
      if (
        params.filters.isActiveStudent &&
        params.filters.isActiveStudent !== "all"
      ) {
        console.log(
          "Adding isActiveStudent filter:",
          params.filters.isActiveStudent
        );
        whereConditions.push(
          eq(participants.isActiveStudent, params.filters.isActiveStudent)
        );
      }
      if (
        params.filters.isTeenMother &&
        params.filters.isTeenMother !== "all"
      ) {
        console.log("Adding isTeenMother filter:", params.filters.isTeenMother);
        whereConditions.push(
          eq(participants.isTeenMother, params.filters.isTeenMother)
        );
      }
      if (
        params.filters.sourceOfIncome &&
        params.filters.sourceOfIncome !== "all"
      ) {
        console.log(
          "Adding sourceOfIncome filter:",
          params.filters.sourceOfIncome
        );
        whereConditions.push(
          eq(participants.sourceOfIncome, params.filters.sourceOfIncome)
        );
      }
      if (
        params.filters.enterpriseSector &&
        params.filters.enterpriseSector !== "all"
      ) {
        console.log(
          "Adding enterpriseSector filter:",
          params.filters.enterpriseSector
        );
        whereConditions.push(
          eq(participants.enterpriseSector, params.filters.enterpriseSector)
        );
      }
      if (
        params.filters.businessScale &&
        params.filters.businessScale !== "all"
      ) {
        console.log(
          "Adding businessScale filter:",
          params.filters.businessScale
        );
        whereConditions.push(
          eq(participants.businessScale, params.filters.businessScale)
        );
      }
      if (params.filters.nationality && params.filters.nationality !== "all") {
        console.log("Adding nationality filter:", params.filters.nationality);
        whereConditions.push(
          eq(participants.nationality, params.filters.nationality)
        );
      }
      if (
        params.filters.locationSetting &&
        params.filters.locationSetting !== "all"
      ) {
        console.log(
          "Adding locationSetting filter:",
          params.filters.locationSetting
        );
        whereConditions.push(
          eq(participants.locationSetting, params.filters.locationSetting)
        );
      }
      if (params.filters.isRefugee && params.filters.isRefugee !== "all") {
        console.log("Adding isRefugee filter:", params.filters.isRefugee);
        whereConditions.push(
          eq(participants.isRefugee, params.filters.isRefugee)
        );
      }
      if (params.filters.isMother && params.filters.isMother !== "all") {
        console.log("Adding isMother filter:", params.filters.isMother);
        whereConditions.push(
          eq(participants.isMother, params.filters.isMother)
        );
      }
    }

    // Add search condition if search term is provided
    if (params?.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`;

      whereConditions.push(
        sql`(LOWER(${participants.firstName}) LIKE ${searchTerm} OR 
             LOWER(${participants.lastName}) LIKE ${searchTerm} OR
             LOWER(${participants.designation}) LIKE ${searchTerm} OR
             LOWER(${participants.enterprise}) LIKE ${searchTerm})`
      );
    }

    const [participantsData, totalCount] = await Promise.all([
      db.query.participants.findMany({
        where: and(...whereConditions),
        limit,
        offset,
        orderBy: [asc(participants.firstName), asc(participants.lastName)],
        with: {
          cluster: true,
          project: true,
        },
      }),
      db.query.participants.findMany({
        where: and(...whereConditions),
        columns: {
          id: true,
        },
      }),
    ]);

    // Get organization names for all participants
    const organizationIds = [
      ...new Set(participantsData.map(p => p.organization_id)),
    ];

    let orgs: Array<{ id: string; name: string }> = [];
    if (organizationIds.length > 0) {
      orgs = await db.query.organizations.findMany({
        where: (organizations, { inArray }) =>
          inArray(organizations.id, organizationIds),
        columns: {
          id: true,
          name: true,
        },
      });
    }

    const orgMap = new Map(orgs.map(org => [org.id, org.name]));

    // We want to just pass the district, subCounty, and country values directly
    // The LocationNameCell will handle fetching and displaying the actual names

    // Enhance participant data with organization, project, and location names
    const data = participantsData.map(participant => ({
      ...participant,
      organizationName: orgMap.get(participant.organization_id) || "Unknown",
      projectName: participant.project?.name || "Unknown",
      projectAcronym: participant.project?.acronym || "UNK",
      clusterName: participant.cluster?.name || "Unknown",
      // We'll pass these values directly to the LocationNameCell component later
      districtName: participant.district,
      subCountyName: participant.subCounty,
      countyName: participant.country,
    }));

    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit),
          hasNext: page * limit < totalCount.length,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error getting participants:", error);
    return {
      success: false,
      error: "Failed to get participants",
    };
  }
}

export async function createParticipant(
  data: NewParticipant
): Promise<ParticipantResponse> {
  try {
    if (!data.cluster_id || !data.project_id || !data.organization_id) {
      return {
        success: false,
        error: "cluster_id, project_id, and organization_id are required",
      };
    }

    // Verify that the organization exists and belongs to the cluster
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, data.organization_id),
    });

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Verify that the organization belongs to the cluster
    const clusterMember = await db.query.clusterMembers.findFirst({
      where: and(
        eq(clusterMembers.organization_id, data.organization_id),
        eq(clusterMembers.cluster_id, data.cluster_id)
      ),
    });

    if (!clusterMember) {
      return {
        success: false,
        error: "Organization does not belong to the specified cluster",
      };
    }

    // Calculate age from date of birth if provided, otherwise leave age as null
    let calculatedAge: number | null = null;
    if (data.dateOfBirth) {
      const validation = validateDateOfBirth(data.dateOfBirth);
      if (validation.isValid) {
        calculatedAge = calculateAge(data.dateOfBirth);
        console.log(
          `Calculated age ${calculatedAge} from date of birth ${data.dateOfBirth}`
        );
      } else {
        console.warn(
          `Invalid date of birth: ${validation.error}, leaving age as null`
        );
        calculatedAge = null;
      }
    } else if (data.age) {
      // Only use provided age if dateOfBirth is empty but age is provided
      calculatedAge = data.age;
      console.log(`Using provided age: ${calculatedAge}`);
    } else {
      console.log(`No date of birth or age provided, leaving age as null`);
      calculatedAge = null;
    }

    const [participant] = await db
      .insert(participants)
      .values({
        ...data,
        age: calculatedAge, // Use calculated age instead of provided age
        cluster_id: data.cluster_id,
        project_id: data.project_id,
        organization_id: data.organization_id,
      })
      .returning();

    revalidatePath(`/clusters/${data.cluster_id}/participants`);
    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error creating participant:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create participant",
    };
  }
}

export async function updateParticipant(
  id: string,
  data: NewParticipant
): Promise<ParticipantResponse> {
  try {
    // Calculate age from date of birth if provided, otherwise leave age as null
    let calculatedAge: number | null = null;
    if (data.dateOfBirth) {
      const validation = validateDateOfBirth(data.dateOfBirth);
      if (validation.isValid) {
        calculatedAge = calculateAge(data.dateOfBirth);
        console.log(
          `Calculated age ${calculatedAge} from date of birth ${data.dateOfBirth}`
        );
      } else {
        console.warn(
          `Invalid date of birth: ${validation.error}, leaving age as null`
        );
        calculatedAge = null;
      }
    } else if (data.age) {
      // Only use provided age if dateOfBirth is empty but age is provided
      calculatedAge = data.age;
      console.log(`Using provided age: ${calculatedAge}`);
    } else {
      console.log(`No date of birth or age provided, leaving age as null`);
      calculatedAge = null;
    }

    const [participant] = await db
      .update(participants)
      .set({
        ...data,
        age: calculatedAge, // Use calculated age instead of provided age
      })
      .where(eq(participants.id, id))
      .returning();

    revalidatePath(`/clusters/${data.cluster_id}/participants`);
    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error updating participant:", error);
    return {
      success: false,
      error: "Failed to update participant",
    };
  }
}

export async function deleteParticipant(
  id: string
): Promise<ParticipantResponse> {
  try {
    const [participant] = await db
      .delete(participants)
      .where(eq(participants.id, id))
      .returning();

    revalidatePath(`/clusters/${participant.cluster_id}/participants`);
    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error deleting participant:", error);
    return {
      success: false,
      error: "Failed to delete participant",
    };
  }
}

export async function getAllParticipantsForMetrics(
  clusterId: string
): Promise<ParticipantsResponse> {
  try {
    // Get all participants for the cluster without pagination or filters
    const allParticipants = await db.query.participants.findMany({
      where: eq(participants.cluster_id, clusterId),
      orderBy: asc(participants.id),
    });

    return {
      success: true,
      data: {
        data: allParticipants,
        pagination: {
          page: 1,
          limit: allParticipants.length,
          total: allParticipants.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching all participants for metrics:", error);
    return {
      success: false,
      error: "Failed to fetch participants metrics",
    };
  }
}

export async function getAllFilteredParticipantsForExport(
  clusterId: string,
  filters?: {
    cluster?: string;
    project?: string;
    organization?: string;
    district?: string;
    subCounty?: string;
    enterprise?: string;
    sex?: string;
    isPWD?: string;
    ageGroup?: string;
    maritalStatus?: string;
    educationLevel?: string;
    isSubscribedToVSLA?: string;
    ownsEnterprise?: string;
    employmentType?: string;
    employmentSector?: string;
    hasVocationalSkills?: string;
    hasSoftSkills?: string;
    hasBusinessSkills?: string;
    specificVocationalSkill?: string;
    specificSoftSkill?: string;
    specificBusinessSkill?: string;
    populationSegment?: string;
    isActiveStudent?: string;
    isTeenMother?: string;
    sourceOfIncome?: string;
    enterpriseSector?: string;
    businessScale?: string;
    nationality?: string;
    locationSetting?: string;
    isRefugee?: string;
    isMother?: string;
  },
  search?: string
): Promise<ParticipantsResponse> {
  try {
    console.log("🔍 getAllFilteredParticipantsForExport called with:", {
      clusterId,
      filters,
      search,
    });

    const whereConditions = [eq(participants.cluster_id, clusterId)];

    // Add filter conditions (same logic as getParticipants)
    if (filters) {
      console.log("📝 Processing export filters:", filters);

      if (filters.project && filters.project !== "all") {
        console.log("Adding project filter:", filters.project);
        whereConditions.push(eq(participants.project_id, filters.project));
      }
      if (filters.organization && filters.organization !== "all") {
        console.log("Adding organization filter:", filters.organization);
        whereConditions.push(
          eq(participants.organization_id, filters.organization)
        );
      }
      if (filters.district && filters.district !== "all") {
        console.log("Adding district filter:", filters.district);
        whereConditions.push(eq(participants.district, filters.district));
      }
      if (filters.subCounty && filters.subCounty !== "all") {
        console.log("Adding subCounty filter:", filters.subCounty);
        whereConditions.push(eq(participants.subCounty, filters.subCounty));
      }
      if (filters.enterprise && filters.enterprise !== "all") {
        console.log("Adding enterprise filter:", filters.enterprise);
        whereConditions.push(eq(participants.enterprise, filters.enterprise));
      }
      if (filters.sex && filters.sex !== "all") {
        console.log("Adding sex filter:", filters.sex);
        whereConditions.push(eq(participants.sex, filters.sex));
      }
      if (filters.isPWD && filters.isPWD !== "all") {
        console.log("Adding isPWD filter:", filters.isPWD);
        whereConditions.push(eq(participants.isPWD, filters.isPWD));
      }
      if (filters.ageGroup && filters.ageGroup !== "all") {
        console.log("Adding ageGroup filter:", filters.ageGroup);
        if (filters.ageGroup === "young") {
          whereConditions.push(
            sql`${participants.age} >= 15 AND ${participants.age} <= 35`
          );
        } else if (filters.ageGroup === "adult") {
          whereConditions.push(
            sql`${participants.age} >= 36 AND ${participants.age} <= 59`
          );
        } else if (filters.ageGroup === "older") {
          whereConditions.push(sql`${participants.age} >= 60`);
        }
      }

      // Additional filters for comprehensive export filtering
      if (filters.maritalStatus && filters.maritalStatus !== "all") {
        console.log("Adding maritalStatus filter:", filters.maritalStatus);
        whereConditions.push(
          eq(participants.maritalStatus, filters.maritalStatus)
        );
      }
      if (filters.educationLevel && filters.educationLevel !== "all") {
        console.log("Adding educationLevel filter:", filters.educationLevel);
        whereConditions.push(
          eq(participants.educationLevel, filters.educationLevel)
        );
      }
      if (filters.isSubscribedToVSLA && filters.isSubscribedToVSLA !== "all") {
        console.log(
          "Adding isSubscribedToVSLA filter:",
          filters.isSubscribedToVSLA
        );
        whereConditions.push(
          eq(participants.isSubscribedToVSLA, filters.isSubscribedToVSLA)
        );
      }
      if (filters.ownsEnterprise && filters.ownsEnterprise !== "all") {
        console.log("Adding ownsEnterprise filter:", filters.ownsEnterprise);
        whereConditions.push(
          eq(participants.ownsEnterprise, filters.ownsEnterprise)
        );
      }
      if (filters.employmentType && filters.employmentType !== "all") {
        console.log("Adding employmentType filter:", filters.employmentType);
        whereConditions.push(
          eq(participants.employmentType, filters.employmentType)
        );
      }
      if (filters.employmentSector && filters.employmentSector !== "all") {
        console.log(
          "Adding employmentSector filter:",
          filters.employmentSector
        );
        whereConditions.push(
          eq(participants.employmentSector, filters.employmentSector)
        );
      }
      if (
        filters.hasVocationalSkills &&
        filters.hasVocationalSkills !== "all"
      ) {
        console.log(
          "Adding hasVocationalSkills filter:",
          filters.hasVocationalSkills
        );
        whereConditions.push(
          eq(participants.hasVocationalSkills, filters.hasVocationalSkills)
        );
      }
      if (filters.hasSoftSkills && filters.hasSoftSkills !== "all") {
        console.log("Adding hasSoftSkills filter:", filters.hasSoftSkills);
        whereConditions.push(
          eq(participants.hasSoftSkills, filters.hasSoftSkills)
        );
      }
      if (filters.hasBusinessSkills && filters.hasBusinessSkills !== "all") {
        console.log(
          "Adding hasBusinessSkills filter:",
          filters.hasBusinessSkills
        );
        whereConditions.push(
          eq(participants.hasBusinessSkills, filters.hasBusinessSkills)
        );
      }

      // Specific skills filters for export
      if (
        filters.specificVocationalSkill &&
        filters.specificVocationalSkill !== "all"
      ) {
        console.log(
          "Adding specificVocationalSkill filter:",
          filters.specificVocationalSkill
        );
        whereConditions.push(
          sql`(
            ${participants.vocationalSkillsParticipations} && ARRAY[${filters.specificVocationalSkill}] OR
            ${participants.vocationalSkillsCompletions} && ARRAY[${filters.specificVocationalSkill}] OR
            ${participants.vocationalSkillsCertifications} && ARRAY[${filters.specificVocationalSkill}]
          )`
        );
      }
      if (filters.specificSoftSkill && filters.specificSoftSkill !== "all") {
        console.log(
          "Adding specificSoftSkill filter:",
          filters.specificSoftSkill
        );
        whereConditions.push(
          sql`(
            ${participants.softSkillsParticipations} && ARRAY[${filters.specificSoftSkill}] OR
            ${participants.softSkillsCompletions} && ARRAY[${filters.specificSoftSkill}] OR
            ${participants.softSkillsCertifications} && ARRAY[${filters.specificSoftSkill}]
          )`
        );
      }
      if (
        filters.specificBusinessSkill &&
        filters.specificBusinessSkill !== "all"
      ) {
        console.log(
          "Adding specificBusinessSkill filter:",
          filters.specificBusinessSkill
        );
        whereConditions.push(
          sql`(
            ${participants.vocationalSkillsParticipations} && ARRAY[${filters.specificBusinessSkill}] OR
            ${participants.vocationalSkillsCompletions} && ARRAY[${filters.specificBusinessSkill}] OR
            ${participants.vocationalSkillsCertifications} && ARRAY[${filters.specificBusinessSkill}]
          )`
        );
      }

      if (filters.populationSegment && filters.populationSegment !== "all") {
        console.log(
          "Adding populationSegment filter:",
          filters.populationSegment
        );
        whereConditions.push(
          eq(participants.populationSegment, filters.populationSegment)
        );
      }
      if (filters.isActiveStudent && filters.isActiveStudent !== "all") {
        console.log("Adding isActiveStudent filter:", filters.isActiveStudent);
        whereConditions.push(
          eq(participants.isActiveStudent, filters.isActiveStudent)
        );
      }
      if (filters.isTeenMother && filters.isTeenMother !== "all") {
        console.log("Adding isTeenMother filter:", filters.isTeenMother);
        whereConditions.push(
          eq(participants.isTeenMother, filters.isTeenMother)
        );
      }
      if (filters.sourceOfIncome && filters.sourceOfIncome !== "all") {
        console.log("Adding sourceOfIncome filter:", filters.sourceOfIncome);
        whereConditions.push(
          eq(participants.sourceOfIncome, filters.sourceOfIncome)
        );
      }
      if (filters.enterpriseSector && filters.enterpriseSector !== "all") {
        console.log(
          "Adding enterpriseSector filter:",
          filters.enterpriseSector
        );
        whereConditions.push(
          eq(participants.enterpriseSector, filters.enterpriseSector)
        );
      }
      if (filters.businessScale && filters.businessScale !== "all") {
        console.log("Adding businessScale filter:", filters.businessScale);
        whereConditions.push(
          eq(participants.businessScale, filters.businessScale)
        );
      }
      if (filters.nationality && filters.nationality !== "all") {
        console.log("Adding nationality filter:", filters.nationality);
        whereConditions.push(eq(participants.nationality, filters.nationality));
      }
      if (filters.locationSetting && filters.locationSetting !== "all") {
        console.log("Adding locationSetting filter:", filters.locationSetting);
        whereConditions.push(
          eq(participants.locationSetting, filters.locationSetting)
        );
      }
      if (filters.isRefugee && filters.isRefugee !== "all") {
        console.log("Adding isRefugee filter:", filters.isRefugee);
        whereConditions.push(eq(participants.isRefugee, filters.isRefugee));
      }
      if (filters.isMother && filters.isMother !== "all") {
        console.log("Adding isMother filter:", filters.isMother);
        whereConditions.push(eq(participants.isMother, filters.isMother));
      }
    }

    // Add search condition if search term is provided
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      whereConditions.push(
        sql`(LOWER(${participants.firstName}) LIKE ${searchTerm} OR 
             LOWER(${participants.lastName}) LIKE ${searchTerm} OR
             LOWER(${participants.designation}) LIKE ${searchTerm} OR
             LOWER(${participants.enterprise}) LIKE ${searchTerm})`
      );
    }

    // Get all filtered participants without pagination
    const participantsData = await db.query.participants.findMany({
      where: and(...whereConditions),
      orderBy: [asc(participants.firstName), asc(participants.lastName)],
      with: {
        cluster: true,
        project: true,
      },
    });

    // Get organization names for all participants
    const organizationIds = [
      ...new Set(participantsData.map(p => p.organization_id)),
    ];

    let orgs: Array<{ id: string; name: string }> = [];
    if (organizationIds.length > 0) {
      orgs = await db.query.organizations.findMany({
        where: (organizations, { inArray }) =>
          inArray(organizations.id, organizationIds),
        columns: {
          id: true,
          name: true,
        },
      });
    }

    const orgMap = new Map(orgs.map(org => [org.id, org.name]));

    // Enhance participant data with organization, project, and location names
    const data = participantsData.map(participant => ({
      ...participant,
      organizationName: orgMap.get(participant.organization_id) || "Unknown",
      projectName: participant.project?.name || "Unknown",
      projectAcronym: participant.project?.acronym || "UNK",
      clusterName: participant.cluster?.name || "Unknown",
      districtName: participant.district,
      subCountyName: participant.subCounty,
      countyName: participant.country,
    }));

    return {
      success: true,
      data: {
        data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  } catch (error) {
    console.error("Error getting filtered participants for export:", error);
    return {
      success: false,
      error: "Failed to get participants for export",
    };
  }
}
