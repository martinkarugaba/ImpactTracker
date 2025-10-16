"use server";

import { getInterventions } from "./get-interventions";
import { createInterventions } from "./create-interventions";

export async function persistInterventions(): Promise<{
  success: boolean;
  inserted?: number;
  error?: string;
}> {
  try {
    const res = await getInterventions();
    if (!res.success || !res.data)
      return { success: false, error: res.error ?? "No interventions found" };

    const createRes = await createInterventions(res.data);
    return createRes;
  } catch (error) {
    console.error("persistInterventions error", error);
    return { success: false, error: (error as Error).message };
  }
}
