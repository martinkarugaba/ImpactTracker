"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { VSLA } from "../../types";
import { EditVSLADialog } from "../dialogs";
import { Organization } from "@/features/organizations/types";
import { Project } from "@/features/projects/types";
import { Cluster } from "@/features/clusters/components/clusters-table";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getProjects } from "@/features/projects/actions/projects";
import { getClusters } from "@/features/clusters/actions/clusters";

interface VSLADetailsHeaderProps {
  vsla: VSLA;
}

export function VSLADetailsHeader({ vsla }: VSLADetailsHeaderProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [orgsResult, projectsResult, clustersResult] = await Promise.all([
          getOrganizations(),
          getProjects(),
          getClusters(),
        ]);

        if (orgsResult.success && orgsResult.data) {
          setOrganizations(orgsResult.data);
        }
        if (projectsResult.success && projectsResult.data) {
          setProjects(projectsResult.data);
        }
        if (clustersResult.success && clustersResult.data) {
          setClusters(clustersResult.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{vsla.name}</h1>
          <div className="text-muted-foreground flex items-center gap-2">
            <span>{vsla.code}</span>
            {vsla.village && (
              <>
                <span>•</span>
                <span>
                  {vsla.village}, {vsla.district}
                </span>
              </>
            )}
            <span>•</span>
            <Badge
              variant={
                vsla.status === "active"
                  ? "default"
                  : vsla.status === "inactive"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize"
            >
              {vsla.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditVSLADialog
            vsla={vsla}
            organizations={organizations}
            clusters={clusters}
            projects={projects}
          >
            <Button variant="outline" size="sm" disabled={isLoading}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit VSLA
            </Button>
          </EditVSLADialog>
        </div>
      </div>
    </div>
  );
}
