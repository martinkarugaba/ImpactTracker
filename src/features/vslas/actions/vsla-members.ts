"use server";

import { db } from "@/lib/db";
import { vslaMembers } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createVSLAMemberSchema = z.object({
  vsla_id: z.string().min(1, "VSLA is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  joined_date: z.date({
    required_error: "Joined date is required",
  }),
  total_savings: z.number().min(0, "Total savings must be 0 or greater"),
  total_loans: z.number().min(0, "Total loans must be 0 or greater"),
  status: z.string().min(1, "Status is required"),
});

export type CreateVSLAMemberInput = z.infer<typeof createVSLAMemberSchema>;

export async function createVSLAMember(data: CreateVSLAMemberInput) {
  try {
    const validatedData = createVSLAMemberSchema.parse(data);

    const [member] = await db
      .insert(vslaMembers)
      .values(validatedData)
      .returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: member };
  } catch (error) {
    console.error("Error creating VSLA member:", error);
    return { success: false, error: "Failed to create VSLA member" };
  }
}

export async function getVSLAMembers(vsla_id: string) {
  try {
    const members = await db
      .select()
      .from(vslaMembers)
      .where(eq(vslaMembers.vsla_id, vsla_id));

    return { success: true, data: members };
  } catch (error) {
    console.error("Error fetching VSLA members:", error);
    return { success: false, error: "Failed to fetch VSLA members" };
  }
}

export async function getVSLAMember(id: string) {
  try {
    const [member] = await db
      .select()
      .from(vslaMembers)
      .where(eq(vslaMembers.id, id));

    if (!member) {
      return { success: false, error: "VSLA member not found" };
    }

    return { success: true, data: member };
  } catch (error) {
    console.error("Error fetching VSLA member:", error);
    return { success: false, error: "Failed to fetch VSLA member" };
  }
}

export async function updateVSLAMember(
  id: string,
  data: Partial<CreateVSLAMemberInput>
) {
  try {
    const [member] = await db
      .update(vslaMembers)
      .set({ ...data, updated_at: new Date() })
      .where(eq(vslaMembers.id, id))
      .returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: member };
  } catch (error) {
    console.error("Error updating VSLA member:", error);
    return { success: false, error: "Failed to update VSLA member" };
  }
}

export async function deleteVSLAMember(id: string) {
  try {
    await db.delete(vslaMembers).where(eq(vslaMembers.id, id));

    revalidatePath("/dashboard/vslas");
    return { success: true };
  } catch (error) {
    console.error("Error deleting VSLA member:", error);
    return { success: false, error: "Failed to delete VSLA member" };
  }
}

export async function deleteVSLAMembers(ids: string[]) {
  try {
    await db.delete(vslaMembers).where(inArray(vslaMembers.id, ids));

    revalidatePath("/dashboard/vslas");
    return { success: true };
  } catch (error) {
    console.error("Error deleting VSLA members:", error);
    return { success: false, error: "Failed to delete VSLA members" };
  }
}
