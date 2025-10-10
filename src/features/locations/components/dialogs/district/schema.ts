"use client";

import { z } from "zod";
import type { countries } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Country = InferSelectModel<typeof countries>;

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  countryId: z.string().min(1, "Country is required"),
});

export type FormValues = z.infer<typeof formSchema>;

export interface AddDistrictDialogProps {
  children: React.ReactNode;
  countries?: Country[];
}
