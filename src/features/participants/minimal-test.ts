"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { auth } from "@/features/auth/auth";

export async function runMinimalImportTest() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    console.log("=== MINIMAL IMPORT TEST ===");
    console.log("User ID:", session.user.id);

    // Get actual IDs from database
    const [cluster, project, organization] = await Promise.all([
      db.query.clusters.findFirst(),
      db.query.projects.findFirst(),
      db.query.organizations.findFirst(),
    ]);

    if (!cluster || !project || !organization) {
      return {
        success: false,
        error: "Missing required database entities",
        debug: {
          cluster: !!cluster,
          project: !!project,
          organization: !!organization,
        },
      };
    }

    console.log("Found entities:", {
      cluster: cluster.name,
      project: project.name,
      organization: organization.name,
    });

    // Check user membership
    const membership = await db.query.organizationMembers.findFirst({
      where: (members, { eq, and }) =>
        and(
          eq(members.organization_id, organization.id),
          eq(members.user_id, session.user.id)
        ),
    });

    console.log("User membership:", !!membership);

    // Simple test participant data
    const testData = {
      firstName: "Test",
      lastName: "User",
      sex: "male" as const,
      age: 25,
      dateOfBirth: null,
      contact: "0700000000",
      isPWD: "no" as const,
      isMother: "no" as const,
      isRefugee: "no" as const,
      cluster_id: cluster.id,
      project_id: project.id,
      organization_id: organization.id,
      country: "Uganda",
      district: "Kampala",
      subCounty: "Central",
      parish: "Test Parish",
      village: "Test Village",
      designation: "Test",
      enterprise: "Test",
      isPermanentResident: "no" as const,
      areParentsAlive: "yes" as const,
      numberOfChildren: 0,
      employmentStatus: "employed",
      monthlyIncome: 50000,
      mainChallenge: "Test challenge",
      skillOfInterest: "Test skill",
      expectedImpact: "Test impact",
      isWillingToParticipate: "yes" as const,
    };

    console.log(
      "Attempting insert with data:",
      JSON.stringify(testData, null, 2)
    );

    // Direct insert test
    const insertResult = await db
      .insert(participants)
      .values(testData)
      .returning();

    console.log("Insert result:", insertResult);

    // Count participants to verify
    const participantCount = await db.query.participants.findMany();
    console.log("Total participants after insert:", participantCount.length);

    return {
      success: true,
      data: {
        insertResult,
        totalParticipants: participantCount.length,
        testData,
        entities: {
          cluster: cluster.name,
          project: project.name,
          organization: organization.name,
        },
        userMembership: !!membership,
      },
    };
  } catch (error) {
    console.error("Minimal import test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    };
  }
}
