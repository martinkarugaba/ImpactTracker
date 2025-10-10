"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { Cluster } from "@/features/clusters/components/clusters-table";

interface ClusterSelectorProps {
  clusters: Cluster[];
}

export function ClusterSelector({ clusters }: ClusterSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");

  useEffect(() => {
    const clusterId = searchParams.get("clusterId");
    if (clusterId) {
      setSelectedClusterId(clusterId);
    } else if (clusters.length > 0) {
      setSelectedClusterId(clusters[0].id);
    }
  }, [searchParams, clusters]);

  const handleClusterChange = (value: string) => {
    setSelectedClusterId(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set("clusterId", value);

    router.push(`/dashboard/organizations?${params.toString()}`);
  };

  if (clusters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Filter by cluster:</span>
      <Select value={selectedClusterId} onValueChange={handleClusterChange}>
        <SelectTrigger className="h-10 w-[200px]">
          <SelectValue placeholder="Select a cluster" />
        </SelectTrigger>
        <SelectContent>
          {clusters.map(cluster => (
            <SelectItem key={cluster.id} value={cluster.id}>
              {cluster.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
