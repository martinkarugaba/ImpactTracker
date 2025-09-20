"use client";

import { useAtomValue } from "jotai";
import { UserX } from "lucide-react";
import { hasDuplicatesAtom } from "./atoms";

export function EmptyState() {
  const hasDuplicates = useAtomValue(hasDuplicatesAtom);

  if (hasDuplicates) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
        <UserX className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No Duplicates Found</h3>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        All participants appear to be unique based on their name and contact
        information.
      </p>
    </div>
  );
}
