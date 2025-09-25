import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force Node.js runtime to support database connections
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("=== DEBUGGING PARTICIPANTS ===");

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

    // If there are participants, test the getParticipants function
    let getParticipantsResult = null;
    if (allParticipants.length > 0) {
      const firstParticipant = allParticipants[0];
      console.log(
        "Testing getParticipants with cluster_id:",
        firstParticipant.cluster_id
      );

      // Import the getParticipants function
      const { getParticipants } = await import(
        "@/features/participants/actions"
      );
      getParticipantsResult = await getParticipants(
        firstParticipant.cluster_id
      );

      console.log("getParticipants result:", getParticipantsResult);
    }

    return NextResponse.json({
      success: true,
      data: {
        participantsCount: allParticipants.length,
        clustersCount: allClusters.length,
        sampleParticipant: allParticipants[0] || null,
        sampleCluster: allClusters[0] || null,
        getParticipantsResult,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
