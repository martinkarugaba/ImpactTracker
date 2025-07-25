"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activityReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  type NewActivityReport,
  type ActivityReportResponse,
  type ActivityReportsResponse,
} from "../types/types";

export async function createActivityReport(
  data: NewActivityReport
): Promise<ActivityReportResponse> {
  try {
    const [activityReport] = await db
      .insert(activityReports)
      .values(data)
      .returning();

    revalidatePath(`/dashboard/activities/${data.activity_id}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: activityReport,
    };
  } catch (error) {
    console.error("Error creating activity report:", error);
    return {
      success: false,
      error: "Failed to create activity report",
    };
  }
}

export async function updateActivityReport(
  id: string,
  data: Partial<NewActivityReport>
): Promise<ActivityReportResponse> {
  try {
    const [activityReport] = await db
      .update(activityReports)
      .set({ ...data, updated_at: new Date() })
      .where(eq(activityReports.id, id))
      .returning();

    if (!activityReport) {
      return {
        success: false,
        error: "Activity report not found",
      };
    }

    revalidatePath(`/dashboard/activities/${activityReport.activity_id}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: activityReport,
    };
  } catch (error) {
    console.error("Error updating activity report:", error);
    return {
      success: false,
      error: "Failed to update activity report",
    };
  }
}

export async function getActivityReport(
  id: string
): Promise<ActivityReportResponse> {
  try {
    const activityReport = await db.query.activityReports.findFirst({
      where: eq(activityReports.id, id),
    });

    if (!activityReport) {
      return {
        success: false,
        error: "Activity report not found",
      };
    }

    return {
      success: true,
      data: activityReport,
    };
  } catch (error) {
    console.error("Error fetching activity report:", error);
    return {
      success: false,
      error: "Failed to fetch activity report",
    };
  }
}

export async function getActivityReportsByActivity(
  activityId: string
): Promise<ActivityReportsResponse> {
  try {
    const reports = await db.query.activityReports.findMany({
      where: eq(activityReports.activity_id, activityId),
      orderBy: (activityReports, { desc }) => [
        desc(activityReports.created_at),
      ],
    });

    return {
      success: true,
      data: reports,
    };
  } catch (error) {
    console.error("Error fetching activity reports:", error);
    return {
      success: false,
      error: "Failed to fetch activity reports",
    };
  }
}

export async function deleteActivityReport(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [deletedReport] = await db
      .delete(activityReports)
      .where(eq(activityReports.id, id))
      .returning();

    if (!deletedReport) {
      return {
        success: false,
        error: "Activity report not found",
      };
    }

    revalidatePath(`/dashboard/activities/${deletedReport.activity_id}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting activity report:", error);
    return {
      success: false,
      error: "Failed to delete activity report",
    };
  }
}
