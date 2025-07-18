"use client";

import { Activity } from "../../types/types";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActivityHeaderProps {
  activity: Activity;
  onEdit: () => void;
}

export function ActivityHeader({ activity, onEdit }: ActivityHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <p className="text-muted-foreground text-lg">
            {activity.description}
          </p>
        </div>
      </div>
      <Button onClick={onEdit}>
        <EditIcon className="mr-2 h-4 w-4" />
        Edit Activity
      </Button>
    </div>
  );
}
