"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { type ParticipantFormValues } from "../components/participant-form";
import { calculateAge, validateDateOfBirth } from "../lib/age-calculator";

export async function importParticipants(data: ParticipantFormValues[]) {
  console.log("=== IMPORT STARTED ===");
  console.log("Data length:", data.length);
  console.log("First participant:", data[0]);

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Check for large datasets that might cause issues
  if (data.length > 1000) {
    console.warn("Large dataset detected:", data.length, "participants");
    console.warn("Processing in batches for optimal performance");
  }

  try {
    const session = await auth();
    if (!session?.user) {
      console.log("Authentication failed");
      return { success: false, error: "Not authenticated" };
    }
    console.log("User authenticated:", session.user.id);

    // Get user's global role
    const user = await db.query.users
      .findFirst({
        where: (users, { eq }) => eq(users.id, session.user.id),
      })
      .catch(error => {
        console.error("Database error while fetching user:", error);
        return null;
      });

    if (!user) {
      console.warn(
        `User ${session.user.id} not found in database. Session may be stale.`
      );
      return { success: false, error: "User not found" };
    }

    console.log("User role:", user.role);

    // Determine set of organization IDs referenced in the import
    const orgIds = Array.from(
      new Set(
        data
          .map(p => p.organization_id)
          .filter((v): v is string => typeof v === "string" && v.length > 0)
      )
    );
    if (orgIds.length === 0) {
      return { success: false, error: "Organization ID is required" };
    }

    // Authorization logic based on user role
    if (user.role === "super_admin") {
      // Super admin can import to any organization
      console.log("Super admin: authorized for all organizations");
    } else if (user.role === "cluster_manager") {
      // Cluster manager can import to organizations in their cluster(s)
      console.log("Cluster manager: checking cluster authorization");

      // Get clusters the user manages
      const userClusters = await db.query.clusterUsers.findMany({
        where: (clusterUsers, { eq, and }) =>
          and(
            eq(clusterUsers.user_id, session.user.id),
            eq(clusterUsers.role, "cluster_manager")
          ),
      });

      const managedClusterIds = userClusters.map(cu => cu.cluster_id);
      console.log("Managed clusters:", managedClusterIds);

      // Check if all referenced organizations belong to clusters the user manages
      for (const orgId of orgIds) {
        const org = await db.query.organizations.findFirst({
          where: (organizations, { eq }) => eq(organizations.id, orgId),
        });

        if (
          !org ||
          !org.cluster_id ||
          !managedClusterIds.includes(org.cluster_id)
        ) {
          return {
            success: false,
            error: `Not authorized to import participants for organization ${orgId}. Cluster managers can only import to organizations in their managed clusters.`,
          };
        }
      }
    } else {
      // Regular users must be members of all referenced organizations
      console.log("Regular user: checking organization membership");

      for (const orgId of orgIds) {
        const member = await db.query.organizationMembers.findFirst({
          where: (members, { eq, and }) =>
            and(
              eq(members.organization_id, orgId),
              eq(members.user_id, session.user.id)
            ),
        });
        if (!member) {
          return {
            success: false,
            error: `Not authorized to import participants for organization ${orgId}. You must be a member of all target organizations.`,
          };
        }
      }
    }

    // Keep each row's organization_id as provided (already mapped client-side)
    const participantsData = data;

    console.log("Starting import with data count:", participantsData.length);
    console.log("Sample participant data:", participantsData[0]);

    // First, get organization-to-project mapping
    const orgProjectMap: Record<string, string> = {};
    for (const orgId of orgIds) {
      const org = await db.query.organizations.findFirst({
        where: (organizations, { eq }) => eq(organizations.id, orgId),
      });
      if (!org) {
        console.error("Organization not found:", orgId);
        return {
          success: false,
          error: `Organization with ID ${orgId} does not exist`,
        };
      }
      if (!org.project_id) {
        console.error("Organization has no project:", orgId);
        return {
          success: false,
          error: `Organization ${orgId} is not associated with any project`,
        };
      }
      orgProjectMap[orgId] = org.project_id;
      console.log(
        `✅ Organization verified: ${orgId} -> Project: ${org.project_id}`
      );
    }

    // Update participant data to use the correct project_id from organization mapping
    const updatedParticipantsData = participantsData.map(participant => ({
      ...participant,
      project_id:
        orgProjectMap[participant.organization_id] || participant.project_id,
    }));

    // Validate required fields
    const invalidParticipants = updatedParticipantsData.filter(
      p =>
        !p.project_id ||
        p.project_id.trim() === "" ||
        !p.organization_id ||
        p.organization_id.trim() === "" ||
        !p.cluster_id ||
        p.cluster_id.trim() === ""
    );

    if (invalidParticipants.length > 0) {
      console.error("Invalid participants found:", invalidParticipants.length);
      console.error("Sample invalid participant:", invalidParticipants[0]);
      return {
        success: false,
        error: `${invalidParticipants.length} participants have missing required fields (project_id, organization_id, or cluster_id)`,
      };
    }

    // Validate UUID format for required UUID fields
    const invalidUUIDs = updatedParticipantsData.filter(
      p =>
        !isValidUUID(p.project_id) ||
        !isValidUUID(p.organization_id) ||
        !isValidUUID(p.cluster_id)
    );

    if (invalidUUIDs.length > 0) {
      console.error("Invalid UUID participants found:", invalidUUIDs.length);
      console.error("Sample invalid UUID participant:", invalidUUIDs[0]);
      return {
        success: false,
        error: `${invalidUUIDs.length} participants have invalid UUID format for project_id, organization_id, or cluster_id. These must be valid UUIDs.`,
      };
    }

    // Additional validation: Check if project_id and organization_id exist in database
    console.log("Validating foreign keys...");
    const projectIds = Array.from(
      new Set(updatedParticipantsData.map(p => p.project_id))
    );
    // Reuse existing orgIds variable instead of declaring a new one

    console.log("Project IDs to validate:", projectIds);
    console.log("Organization IDs to validate:", orgIds);

    // Check if projects exist
    for (const projectId of projectIds) {
      const project = await db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId),
      });
      if (!project) {
        console.error("Project not found:", projectId);
        return {
          success: false,
          error: `Project with ID ${projectId} does not exist`,
        };
      }
      console.log(`✅ Project verified: ${projectId}`);
    }

    // Insert all participants
    const insertData = updatedParticipantsData.map(participant => {
      // Validate required fields explicitly to prevent silent failures
      if (!participant.cluster_id) {
        console.error("Missing cluster_id for participant:", participant);
        throw new Error("Missing cluster_id for participant");
      }
      if (!participant.project_id) {
        console.error("Missing project_id for participant:", participant);
        throw new Error("Missing project_id for participant");
      }
      if (!participant.organization_id) {
        console.error("Missing organization_id for participant:", participant);
        throw new Error("Missing organization_id for participant");
      }

      // Calculate age from date of birth if provided, otherwise leave age as null
      let calculatedAge: number | null = null;
      if (participant.dateOfBirth && participant.dateOfBirth.trim() !== "") {
        const validation = validateDateOfBirth(participant.dateOfBirth);
        if (validation.isValid) {
          calculatedAge = calculateAge(participant.dateOfBirth);
          console.log(
            `Calculated age ${calculatedAge} from date of birth ${participant.dateOfBirth}`
          );
        } else {
          console.warn(
            `Invalid date of birth for participant: ${validation.error}, leaving age as null`
          );
          calculatedAge = null;
        }
      } else if (participant.age && participant.age.trim() !== "") {
        // Only use provided age if dateOfBirth is empty but age is provided
        calculatedAge = parseInt(participant.age);
        console.log(`Using provided age: ${calculatedAge}`);
      } else {
        console.log(`No date of birth or age provided, leaving age as null`);
        calculatedAge = null;
      }

      return {
        firstName: participant.firstName,
        lastName: participant.lastName,
        sex: participant.sex,
        age: calculatedAge,
        dateOfBirth: participant.dateOfBirth
          ? new Date(participant.dateOfBirth)
          : null,
        contact: participant.contact,
        isPWD: participant.isPWD,
        isMother: participant.isMother,
        isRefugee: participant.isRefugee,
        cluster_id: participant.cluster_id,
        project_id: participant.project_id,
        organization_id: participant.organization_id,
        country: participant.country,
        district: participant.district,
        subCounty: participant.subCounty,
        parish: participant.parish,
        village: participant.village,
        // Location IDs (when mapping was successful)
        country_id: participant.country_id || null,
        district_id: participant.district_id || null,
        subcounty_id: participant.subcounty_id || null,
        parish_id: participant.parish_id || null,
        village_id: participant.village_id || null,
        designation: participant.designation,
        enterprise: participant.enterprise,
        // Basic required fields
        isPermanentResident: participant.isPermanentResident,
        areParentsAlive: participant.areParentsAlive,
        numberOfChildren: parseInt(participant.numberOfChildren),
        employmentStatus: participant.employmentStatus,
        monthlyIncome: parseInt(participant.monthlyIncome),
        mainChallenge: participant.mainChallenge || null,
        skillOfInterest: participant.skillOfInterest || null,
        expectedImpact: participant.expectedImpact || null,
        isWillingToParticipate: participant.isWillingToParticipate,

        // NEW FIELDS - Personal Information
        maritalStatus: participant.maritalStatus || null,
        educationLevel: participant.educationLevel || null,
        sourceOfIncome: participant.sourceOfIncome || null,
        nationality: participant.nationality || "Ugandan",
        populationSegment: participant.populationSegment || null,
        refugeeLocation: participant.refugeeLocation || null,
        isActiveStudent: participant.isActiveStudent || "no",

        // VSLA Information
        isSubscribedToVSLA: participant.isSubscribedToVSLA || "no",
        vslaName: participant.vslaName || null,

        // Teen Mother
        isTeenMother: participant.isTeenMother || "no",

        // Enterprise Information
        ownsEnterprise: participant.ownsEnterprise || "no",
        enterpriseName: participant.enterpriseName || null,
        enterpriseSector: participant.enterpriseSector || null,
        enterpriseSize: participant.enterpriseSize || null,
        enterpriseYouthMale: parseInt(participant.enterpriseYouthMale) || 0,
        enterpriseYouthFemale: parseInt(participant.enterpriseYouthFemale) || 0,
        enterpriseAdults: parseInt(participant.enterpriseAdults) || 0,

        // Skills Information
        hasVocationalSkills: participant.hasVocationalSkills || "no",
        vocationalSkillsParticipations: Array.isArray(
          participant.vocationalSkillsParticipations
        )
          ? participant.vocationalSkillsParticipations
          : [],
        vocationalSkillsCompletions: Array.isArray(
          participant.vocationalSkillsCompletions
        )
          ? participant.vocationalSkillsCompletions
          : [],
        vocationalSkillsCertifications: Array.isArray(
          participant.vocationalSkillsCertifications
        )
          ? participant.vocationalSkillsCertifications
          : [],

        hasSoftSkills: participant.hasSoftSkills || "no",
        softSkillsParticipations: Array.isArray(
          participant.softSkillsParticipations
        )
          ? participant.softSkillsParticipations
          : [],
        softSkillsCompletions: Array.isArray(participant.softSkillsCompletions)
          ? participant.softSkillsCompletions
          : [],
        softSkillsCertifications: Array.isArray(
          participant.softSkillsCertifications
        )
          ? participant.softSkillsCertifications
          : [],

        hasBusinessSkills: participant.hasBusinessSkills || "no",

        // Employment Details
        employmentType: participant.employmentType || null,
        employmentSector: participant.employmentSector || null,

        // Employment tracking fields (existing)
        disabilityType: participant.disabilityType || null,
        wageEmploymentStatus: null,
        wageEmploymentSector: null,
        wageEmploymentScale: null,
        selfEmploymentStatus: null,
        selfEmploymentSector: null,
        businessScale: null,
        secondaryEmploymentStatus: null,
        secondaryEmploymentSector: null,
        secondaryBusinessScale: null,
        accessedLoans: participant.accessedLoans || "no",
        individualSaving: participant.individualSaving || "no",
        groupSaving: participant.groupSaving || "no",
        locationSetting: participant.locationSetting || null,
      };
    });
    console.log("Data to insert (first participant):", insertData[0]);
    console.log("Insert data length:", insertData.length);

    // Skip the debug test insertion - no more Debug participants

    // Test with just the first participant to debug
    if (insertData.length > 0) {
      console.log("Testing insert with single participant...");
      try {
        const singleResult = await db
          .insert(participants)
          .values([insertData[0]])
          .returning();
        console.log("Single insert result:", singleResult);

        if (singleResult.length === 0) {
          console.error("Single insert returned no results");
          return {
            success: false,
            error: "Database insert returned no results - check constraints",
          };
        }
      } catch (singleError) {
        console.error("Single insert failed:", singleError);
        if (singleError instanceof Error) {
          console.error("Single insert error message:", singleError.message);
          console.error("Single insert error stack:", singleError.stack);
        }
        return {
          success: false,
          error: `Database constraint error: ${singleError instanceof Error ? singleError.message : "Unknown error"}`,
        };
      }
    }

    console.log("Proceeding with full batch insert...");

    // For large datasets, process in smaller batches to avoid timeouts
    const BATCH_SIZE = 200; // Reduced from 500 for better performance
    const result: Array<Record<string, unknown>> = [];

    if (insertData.length > BATCH_SIZE) {
      console.log(
        `Processing ${insertData.length} participants in batches of ${BATCH_SIZE}`
      );

      for (let i = 0; i < insertData.length; i += BATCH_SIZE) {
        const batch = insertData.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(insertData.length / BATCH_SIZE);

        console.log(`Processing batch ${batchNumber}/${totalBatches}`);

        try {
          const batchResult = await db
            .insert(participants)
            .values(batch)
            .returning();
          result.push(...batchResult);
          console.log(
            `Batch ${batchNumber} completed: ${batchResult.length} participants inserted`
          );
        } catch (batchError) {
          console.error(`Batch ${batchNumber} failed:`, batchError);
          throw batchError;
        }
      }
    } else {
      const singleResult = await db
        .insert(participants)
        .values(insertData)
        .returning();
      result.push(...singleResult);
    }

    console.log("Import result:", result);
    console.log("Inserted participants count:", result.length);

    if (result.length === 0) {
      console.error("No participants were inserted despite no errors");
      return {
        success: false,
        error: "No participants were inserted. Check database constraints.",
      };
    }

    revalidatePath("/dashboard/participants");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error importing participants:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to import participants",
    };
  }
}
