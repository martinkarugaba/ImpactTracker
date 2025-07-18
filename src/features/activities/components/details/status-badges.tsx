"use client";

import { Badge } from "@/components/ui/badge";
import {
  getStatusColor,
  getTypeColor,
  formatLabel,
} from "../../utils/status-utils";

interface StatusBadgesProps {
  status: string;
  type: string;
}

export function StatusBadges({ status, type }: StatusBadgesProps) {
  return (
    <div className="flex items-center space-x-2">
      <Badge className={getStatusColor(status)} variant="secondary">
        {formatLabel(status)}
      </Badge>
      <Badge className={getTypeColor(type)} variant="outline">
        {formatLabel(type)}
      </Badge>
    </div>
  );
}
