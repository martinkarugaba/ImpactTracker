"use server";

import { db } from "@/lib/db";

export async function debugParticipants() {
  console.log("=== DEBUGGING PARTICIPANTS ===");

  try {
    // Check if participants exist in database
    const allParticipants = await db.query.participants.findMany({
      limit: 5,
      with: {
        cluster: true,
        project: true,
      },
    });

    console.log("Total participants found:", allParticipants.length);
    console.log("Sample participants:", allParticipants);

    // Check clusters
    const allClusters = await db.query.clusters.findMany({
      limit: 5,
    });

    console.log("Total clusters:", allClusters.length);
    console.log("Sample clusters:", allClusters);

    // Check organizations
    const allOrganizations = await db.query.organizations.findMany({
      limit: 5,
    });

    console.log("Total organizations:", allOrganizations.length);
    console.log("Sample organizations:", allOrganizations);

    // Check projects
    const allProjects = await db.query.projects.findMany({
      limit: 5,
    });

    console.log("Total projects:", allProjects.length);
    console.log("Sample projects:", allProjects);

    // If there are participants, test the getParticipants function
    if (allParticipants.length > 0) {
      const firstParticipant = allParticipants[0];
      console.log(
        "Testing getParticipants with cluster_id:",
        firstParticipant.cluster_id
      );

      // Import the getParticipants function
      const { getParticipants } = await import("./actions");
      const result = await getParticipants(firstParticipant.cluster_id);

      console.log("getParticipants result:", result);
    }

    return {
      success: true,
      data: {
        participantsCount: allParticipants.length,
        clustersCount: allClusters.length,
        organizationsCount: allOrganizations.length,
        projectsCount: allProjects.length,
        sampleParticipant: allParticipants[0] || null,
      },
    };
  } catch (error) {
    console.error("Debug error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
