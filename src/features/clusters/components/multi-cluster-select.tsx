"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Cluster } from "@/features/clusters/types";

interface MultiClusterSelectProps {
  clusters: Cluster[];
  selectedClusterIds: string[];
  onChange: (clusterIds: string[]) => void;
  disabled?: boolean;
}

export function MultiClusterSelect({
  clusters,
  selectedClusterIds,
  onChange,
  disabled = false,
}: MultiClusterSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleCluster = (clusterId: string) => {
    if (selectedClusterIds.includes(clusterId)) {
      onChange(selectedClusterIds.filter(id => id !== clusterId));
    } else {
      onChange([...selectedClusterIds, clusterId]);
    }
  };

  const removeCluster = (clusterId: string) => {
    onChange(selectedClusterIds.filter(id => id !== clusterId));
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-12 w-full justify-between rounded-lg border-gray-300 text-base focus:border-black focus:ring-black",
              !selectedClusterIds.length && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            Select clusters
            <span className="bg-primary/10 ml-2 rounded-md px-1.5 py-0.5 text-xs font-semibold">
              {selectedClusterIds.length} selected
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search clusters..." />
            <CommandEmpty>No clusters found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {clusters.map(cluster => (
                <CommandItem
                  key={cluster.id}
                  value={cluster.name}
                  onSelect={() => toggleCluster(cluster.id)}
                  className="flex items-center justify-between"
                >
                  <div>{cluster.name}</div>
                  {selectedClusterIds.includes(cluster.id) && (
                    <Check className="text-primary h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedClusterIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedClusterIds.map(clusterId => {
            const cluster = clusters.find(c => c.id === clusterId);
            return (
              cluster && (
                <Badge
                  key={clusterId}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {cluster.name}
                  <button
                    type="button"
                    onClick={() => removeCluster(clusterId)}
                    className="focus:ring-primary ml-1 rounded-full outline-none focus:ring-2"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {cluster.name}</span>
                  </button>
                </Badge>
              )
            );
          })}
        </div>
      )}
    </div>
  );
}
