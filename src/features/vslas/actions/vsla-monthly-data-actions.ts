"use server";

import { db } from "@/lib/db";
import { vslaMonthlyData } from "@/lib/db/schema";
import { auth } from "@/features/auth/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface SaveMonthlyDataInput {
  vslaId: string;
  month: string;
  year: string;
  totalLoans: number;
  totalSavings: number;
  totalMeetings: number;
  notes?: string;
}

export async function saveVSLAMonthlyData(input: SaveMonthlyDataInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if record already exists for this VSLA, month, and year
    const existingRecord = await db
      .select()
      .from(vslaMonthlyData)
      .where(
        and(
          eq(vslaMonthlyData.vsla_id, input.vslaId),
          eq(vslaMonthlyData.month, input.month),
          eq(vslaMonthlyData.year, input.year)
        )
      )
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(vslaMonthlyData)
        .set({
          total_loans: input.totalLoans,
          total_savings: input.totalSavings,
          total_meetings: input.totalMeetings,
          notes: input.notes,
          updated_at: new Date(),
        })
        .where(eq(vslaMonthlyData.id, existingRecord[0].id))
        .returning();

      revalidatePath(`/vslas/${input.vslaId}`);

      return {
        success: true,
        data: updated,
        message: `Monthly data for ${input.month} ${input.year} updated successfully`,
      };
    } else {
      // Create new record
      const [created] = await db
        .insert(vslaMonthlyData)
        .values({
          vsla_id: input.vslaId,
          month: input.month,
          year: input.year,
          total_loans: input.totalLoans,
          total_savings: input.totalSavings,
          total_meetings: input.totalMeetings,
          notes: input.notes,
          created_by: session.user.id,
        })
        .returning();

      revalidatePath(`/vslas/${input.vslaId}`);

      return {
        success: true,
        data: created,
        message: `Monthly data for ${input.month} ${input.year} saved successfully`,
      };
    }
  } catch (error) {
    console.error("Error saving VSLA monthly data:", error);
    return {
      success: false,
      error: "Failed to save monthly data",
    };
  }
}

export async function getVSLAMonthlyData(vslaId: string) {
  try {
    const data = await db
      .select()
      .from(vslaMonthlyData)
      .where(eq(vslaMonthlyData.vsla_id, vslaId))
      .orderBy(vslaMonthlyData.year, vslaMonthlyData.month);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching VSLA monthly data:", error);
    return {
      success: false,
      error: "Failed to fetch monthly data",
      data: [],
    };
  }
}

export async function deleteVSLAMonthlyData(id: string, vslaId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await db.delete(vslaMonthlyData).where(eq(vslaMonthlyData.id, id));

    revalidatePath(`/vslas/${vslaId}`);

    return {
      success: true,
      message: "Monthly data deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting VSLA monthly data:", error);
    return {
      success: false,
      error: "Failed to delete monthly data",
    };
  }
}
