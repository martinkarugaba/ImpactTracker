"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { getProjects } from "@/features/projects/actions/projects";
import { getUserClusterId } from "@/features/auth/actions";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { ParticipantsContainer } from "@/features/participants/components/container";
import { ParticipantsPageSkeleton } from "@/features/participants/components/participants-page-skeleton";
import type { Project } from "@/features/projects/types";

interface Cluster {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
  acronym: string;
}

// Loading component for the page
// Using the simplified skeleton from the features folder

// Client-side component that handles async cluster verification
function ParticipantsPageContent() {
  const { data: session, status } = useSession();
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (status === "loading") return; // Wait for session to load
      if (!session?.user?.id) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user's cluster ID first with proper timeout handling
        const userClusterId = await Promise.race([
          getUserClusterId(),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Cluster lookup timeout")), 10000)
          ),
        ]);

        if (!userClusterId) {
          setError("no_cluster");
          setIsLoading(false);
          return;
        }

        setClusterId(userClusterId);

        // Fetch all required data in parallel
        const [organizationsResult, clustersResult, projectsResult] =
          await Promise.allSettled([
            getOrganizations().catch(() => ({ success: false, data: [] })),
            getClusters().catch(() => ({ success: false, data: [] })),
            getProjects().catch(() => ({ success: false, data: [] })),
          ]);

        // Extract organizations (optional)
        const orgs =
          organizationsResult.status === "fulfilled" &&
          organizationsResult.value.success
            ? organizationsResult.value.data || []
            : [];
        setOrganizations(orgs);

        // Extract clusters (optional)
        const clusterData =
          clustersResult.status === "fulfilled" && clustersResult.value.success
            ? clustersResult.value.data || []
            : [];
        setClusters(clusterData);

        // Extract projects (optional)
        const projectData =
          projectsResult.status === "fulfilled" && projectsResult.value.success
            ? projectsResult.value.data || []
            : [];
        setProjects(projectData);

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading participants page data:", err);
        setError("load_error");
        setIsLoading(false);
      }
    }

    fetchData();
  }, [session, status]);

  // Show loading state while checking cluster assignment
  if (status === "loading" || isLoading) {
    return <ParticipantsPageSkeleton />;
  }

  // Handle different error states
  if (error === "no_cluster") {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No cluster assigned</h3>
          <p className="text-muted-foreground mt-2">
            Please contact an administrator to assign you to a cluster.
          </p>
        </div>
      </div>
    );
  }

  if (error === "load_error") {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading participants</h3>
          <p className="text-muted-foreground mt-2">
            Failed to load page data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Not authenticated</h3>
          <p className="text-muted-foreground mt-2">
            Please sign in to view participants.
          </p>
        </div>
      </div>
    );
  }

  if (!clusterId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Loading cluster assignment...
          </h3>
          <p className="text-muted-foreground mt-2">
            Verifying your cluster access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ParticipantsContainer
      clusterId={clusterId}
      projects={projects}
      clusters={clusters}
      organizations={organizations}
    />
  );
}

// Main page component with proper metadata
export default function ParticipantsPage() {
  return (
    <>
      <PageTitle title="Participants" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <ParticipantsPageContent />
          </div>
        </div>
      </div>
    </>
  );
}
