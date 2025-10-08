"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cluster } from "@/features/clusters/types";

interface TableFiltersProps {
  clusters: Cluster[];
  onClusterChange?: (clusterId: string | null) => void;
}

export function TableFilters({ clusters, onClusterChange }: TableFiltersProps) {
  const [selectedCluster, setSelectedCluster] = useState<string>("all");

  const handleClusterChange = (value: string) => {
    setSelectedCluster(value);
    onClusterChange?.(value === "all" ? null : value);
  };

  return (
    <Select value={selectedCluster} onValueChange={handleClusterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select cluster" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Clusters</SelectItem>
        {clusters.map(cluster => (
          <SelectItem key={cluster.id} value={cluster.id}>
            {cluster.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
