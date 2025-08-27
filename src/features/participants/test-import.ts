"use server";

import { participants, organizationMembers } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { auth } from "@/features/auth/auth";

/**
 * A test function to get valid IDs and test database insertion
 */
export async function testParticipantImport() {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log("Not authenticated");
      return { success: false, error: "Not authenticated" };
    }

    console.log("Getting valid IDs from database...");

    // Get first available cluster
    const cluster = await db.query.clusters.findFirst();
    if (!cluster) {
      return { success: false, error: "No clusters found in database" };
    }
    console.log("Found cluster:", cluster.name, "ID:", cluster.id);

    // Get first available project
    const project = await db.query.projects.findFirst();
    if (!project) {
      return { success: false, error: "No projects found in database" };
    }
    console.log("Found project:", project.name, "ID:", project.id);

    // Get first available organization
    const organization = await db.query.organizations.findFirst();
    if (!organization) {
      return { success: false, error: "No organizations found in database" };
    }
    console.log(
      "Found organization:",
      organization.name,
      "ID:",
      organization.id
    );

    // Check if user is a member of this organization
    const membership = await db.query.organizationMembers.findFirst({
      where: (members, { eq, and }) =>
        and(
          eq(members.organization_id, organization.id),
          eq(members.user_id, session.user.id)
        ),
    });

    if (!membership) {
      console.log(
        "User is not a member of any organization. Creating membership..."
      );
      // For testing purposes, let's create a membership
      try {
        await db.insert(organizationMembers).values({
          organization_id: organization.id,
          user_id: session.user.id,
          role: "organization_member",
        });
        console.log("Membership created successfully");
      } catch (membershipError) {
        console.error("Failed to create membership:", membershipError);
        return {
          success: false,
          error: `User is not a member of organization ${organization.name} and failed to create membership`,
        };
      }
    }

    // Test sample data with real IDs
    const testParticipant = {
      firstName: "Test",
      lastName: "Participant",
      sex: "male" as const,
      age: 25,
      dateOfBirth: null,
      contact: "1234567890",
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
      designation: "Test Designation",
      enterprise: "Test Enterprise",
      isPermanentResident: "yes" as const,
      areParentsAlive: "yes" as const,
      numberOfChildren: 0,
      employmentStatus: "employed",
      monthlyIncome: 100000,
      mainChallenge: "None",
      skillOfInterest: "Programming",
      expectedImpact: "High",
      isWillingToParticipate: "yes" as const,
    };

    console.log("Attempting direct DB insert with test data");
    console.log(
      "Test participant data:",
      JSON.stringify(testParticipant, null, 2)
    );

    const result = await db
      .insert(participants)
      .values(testParticipant)
      .returning();
    console.log("Insert result:", result);

    return { success: true, data: result };
  } catch (error) {
    console.error("Test import failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
