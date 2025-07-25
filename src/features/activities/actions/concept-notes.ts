"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { conceptNotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type NewConceptNote, type ConceptNote } from "../types/types";

export type ConceptNoteResponse = {
  success: boolean;
  data?: ConceptNote;
  error?: string;
};

export type ConceptNotesResponse = {
  success: boolean;
  data?: ConceptNote[];
  error?: string;
};

export async function createConceptNote(
  data: NewConceptNote
): Promise<ConceptNoteResponse> {
  try {
    const [conceptNote] = await db
      .insert(conceptNotes)
      .values(data)
      .returning();

    revalidatePath(`/dashboard/activities/${data.activity_id}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: conceptNote,
    };
  } catch (error) {
    console.error("Error creating concept note:", error);
    return {
      success: false,
      error: "Failed to create concept note",
    };
  }
}

export async function updateConceptNote(
  id: string,
  data: Partial<NewConceptNote>
): Promise<ConceptNoteResponse> {
  try {
    const [conceptNote] = await db
      .update(conceptNotes)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(conceptNotes.id, id))
      .returning();

    if (conceptNote) {
      revalidatePath(`/dashboard/activities/${conceptNote.activity_id}`);
      revalidatePath("/dashboard/activities");
    }

    return {
      success: true,
      data: conceptNote,
    };
  } catch (error) {
    console.error("Error updating concept note:", error);
    return {
      success: false,
      error: "Failed to update concept note",
    };
  }
}

export async function getConceptNotesByActivity(
  activityId: string
): Promise<ConceptNotesResponse> {
  try {
    const notes = await db.query.conceptNotes.findMany({
      where: eq(conceptNotes.activity_id, activityId),
      orderBy: (conceptNotes, { desc }) => [desc(conceptNotes.created_at)],
    });

    return {
      success: true,
      data: notes,
    };
  } catch (error) {
    console.error("Error getting concept notes:", error);
    return {
      success: false,
      error: "Failed to get concept notes",
    };
  }
}

export async function getConceptNote(id: string): Promise<ConceptNoteResponse> {
  try {
    const conceptNote = await db.query.conceptNotes.findFirst({
      where: eq(conceptNotes.id, id),
    });

    if (!conceptNote) {
      return {
        success: false,
        error: "Concept note not found",
      };
    }

    return {
      success: true,
      data: conceptNote,
    };
  } catch (error) {
    console.error("Error getting concept note:", error);
    return {
      success: false,
      error: "Failed to get concept note",
    };
  }
}

export async function deleteConceptNote(
  id: string
): Promise<ConceptNoteResponse> {
  try {
    const [conceptNote] = await db
      .delete(conceptNotes)
      .where(eq(conceptNotes.id, id))
      .returning();

    if (conceptNote) {
      revalidatePath(`/dashboard/activities/${conceptNote.activity_id}`);
      revalidatePath("/dashboard/activities");
    }

    return {
      success: true,
      data: conceptNote,
    };
  } catch (error) {
    console.error("Error deleting concept note:", error);
    return {
      success: false,
      error: "Failed to delete concept note",
    };
  }
}
