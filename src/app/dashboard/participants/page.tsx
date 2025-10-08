"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { getProjects } from "@/features/projects/actions/projects";
import { getUserClusterId } from "@/features/auth/actions";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { ParticipantsContainer } from "@/features/participants/components/container";
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
function ParticipantsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs Navigation Skeleton */}
      <div className="w-full">
        <div className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1">
          <div className="grid w-full grid-cols-2">
            <div className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground bg-background text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - Both Metrics and Participants Views */}
      <div className="space-y-6">
        {/* Metrics Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <Card
              key={i}
              className="from-primary/5 to-card bg-gradient-to-t shadow-xs"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-8 w-12" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons Header (for Participants Tab) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left side - Secondary Actions */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[140px]" />{" "}
              {/* Organization Assignment */}
              <Skeleton className="h-9 w-[130px]" /> {/* Import from Excel */}
              <Skeleton className="h-9 w-[120px]" /> {/* Find Duplicates */}
              <Skeleton className="h-9 w-[100px]" /> {/* Export dropdown */}
              <Skeleton className="h-9 w-[110px]" /> {/* Delete selected */}
            </div>

            {/* Right side - Primary Actions */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[90px]" /> {/* Columns */}
              <Skeleton className="h-9 w-[130px]" /> {/* Add Participant */}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Main Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Filter */}
            <Skeleton className="h-10 w-[280px]" />

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-8 w-[70px]" />
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-8 w-[65px]" />
            </div>

            {/* More Filters Button */}
            <Skeleton className="h-8 w-[140px]" />
          </div>

          {/* Filter Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Organization Filters */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Location Filters */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Demographic Filters */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Active Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-[90px] rounded-full" />
            <Skeleton className="h-6 w-[110px] rounded-full" />
            <Skeleton className="h-6 w-[75px] rounded-full" />
            <Skeleton className="h-6 w-[95px] rounded-full" />
          </div>

          {/* Search and Clear */}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Participants Table Section */}
        <div className="space-y-4">
          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    {/* Checkbox column */}
                    <th className="w-[50px] p-4">
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </th>
                    {/* Name column */}
                    <th className="w-[180px] p-4">
                      <Skeleton className="h-4 w-[80px]" />
                    </th>
                    {/* Contact column */}
                    <th className="w-[140px] p-4">
                      <Skeleton className="h-4 w-[60px]" />
                    </th>
                    {/* Age column */}
                    <th className="w-[80px] p-4">
                      <Skeleton className="h-4 w-[35px]" />
                    </th>
                    {/* Gender column */}
                    <th className="w-[100px] p-4">
                      <Skeleton className="h-4 w-[50px]" />
                    </th>
                    {/* Location column */}
                    <th className="w-[200px] p-4">
                      <Skeleton className="h-4 w-[70px]" />
                    </th>
                    {/* Skills column */}
                    <th className="w-[150px] p-4">
                      <Skeleton className="h-4 w-[45px]" />
                    </th>
                    {/* Organization column */}
                    <th className="w-[160px] p-4">
                      <Skeleton className="h-4 w-[85px]" />
                    </th>
                    {/* Actions column */}
                    <th className="w-[50px] p-4">
                      <Skeleton className="h-4 w-[50px]" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {/* Checkbox */}
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </td>
                      {/* Name */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[140px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-[110px]" />
                      </td>
                      {/* Age */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-[25px]" />
                      </td>
                      {/* Gender */}
                      <td className="p-4">
                        <Skeleton className="h-6 w-[60px] rounded-full" />
                      </td>
                      {/* Location */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-[120px]" />
                          <Skeleton className="h-3 w-[90px]" />
                        </div>
                      </td>
                      {/* Skills */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-5 w-[50px] rounded" />
                          <Skeleton className="h-5 w-[40px] rounded" />
                          <Skeleton className="h-5 w-[35px] rounded" />
                        </div>
                      </td>
                      {/* Organization */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-[130px]" />
                      </td>
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-[200px]" /> {/* Results text */}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[80px]" /> {/* Previous button */}
              <Skeleton className="h-9 w-[60px]" /> {/* Next button */}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

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
