"use server";

import { db } from "@/lib/db";
import {
  participants,
  organizations,
  projects,
  clusters,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type ParticipantResponse } from "../types/types";

export async function getParticipant(id: string): Promise<ParticipantResponse> {
  try {
    console.log(`🔄 Fetching participant with ID: ${id}`);

    const result = await db
      .select({
        // Participant fields
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        sex: participants.sex,
        age: participants.age,
        dateOfBirth: participants.dateOfBirth,
        contact: participants.contact,
        designation: participants.designation,
        enterprise: participants.enterprise,
        district: participants.district,
        subCounty: participants.subCounty,
        parish: participants.parish,
        village: participants.village,
        country: participants.country,
        isPWD: participants.isPWD,
        disabilityType: participants.disabilityType,
        isMother: participants.isMother,
        isRefugee: participants.isRefugee,
        isPermanentResident: participants.isPermanentResident,
        areParentsAlive: participants.areParentsAlive,
        numberOfChildren: participants.numberOfChildren,
        employmentStatus: participants.employmentStatus,
        monthlyIncome: participants.monthlyIncome,
        // New employment tracking fields
        wageEmploymentStatus: participants.wageEmploymentStatus,
        wageEmploymentSector: participants.wageEmploymentSector,
        wageEmploymentScale: participants.wageEmploymentScale,
        selfEmploymentStatus: participants.selfEmploymentStatus,
        selfEmploymentSector: participants.selfEmploymentSector,
        businessScale: participants.businessScale,
        secondaryEmploymentStatus: participants.secondaryEmploymentStatus,
        secondaryEmploymentSector: participants.secondaryEmploymentSector,
        secondaryBusinessScale: participants.secondaryBusinessScale,
        // Financial inclusion fields
        accessedLoans: participants.accessedLoans,
        individualSaving: participants.individualSaving,
        groupSaving: participants.groupSaving,
        // Location classification
        locationSetting: participants.locationSetting,
        mainChallenge: participants.mainChallenge,
        skillOfInterest: participants.skillOfInterest,
        expectedImpact: participants.expectedImpact,
        isWillingToParticipate: participants.isWillingToParticipate,
        noOfTrainings: participants.noOfTrainings,
        isActive: participants.isActive,
        created_at: participants.created_at,
        updated_at: participants.updated_at,
        organization_id: participants.organization_id,
        project_id: participants.project_id,
        cluster_id: participants.cluster_id,
        // Related data
        organizationName: organizations.name,
        projectName: projects.name,
        clusterName: clusters.name,
      })
      .from(participants)
      .leftJoin(
        organizations,
        eq(participants.organization_id, organizations.id)
      )
      .leftJoin(projects, eq(participants.project_id, projects.id))
      .leftJoin(clusters, eq(participants.cluster_id, clusters.id))
      .where(eq(participants.id, id))
      .limit(1);

    if (!result || result.length === 0) {
      console.log(`❌ Participant with ID ${id} not found`);
      return {
        success: false,
        error: "Participant not found",
      };
    }

    const participant = result[0];
    console.log(
      `✅ Successfully fetched participant: ${participant.firstName} ${participant.lastName}`
    );

    return {
      success: true,
      data: {
        ...participant,
        organizationName: participant.organizationName || undefined,
        projectName: participant.projectName || undefined,
        clusterName: participant.clusterName || undefined,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching participant:", error);

    if (error instanceof Error) {
      if (error.message.includes("fetch failed")) {
        return {
          success: false,
          error:
            "Database connection failed. Please check your connection and try again.",
        };
      }
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "Failed to fetch participant details",
    };
  }
}
