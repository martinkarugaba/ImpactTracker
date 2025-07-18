"use client";

import { useState } from "react";
import { Activity } from "../types/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  UsersIcon,
  EditIcon,
  ArrowLeftIcon,
  ClockIcon,
  BuildingIcon,
  FolderIcon,
  TargetIcon,
  FileTextIcon,
  DownloadIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ActivityFormDialog } from "./forms/activity-form-dialog";
import { useRouter } from "next/navigation";

interface ActivityDetailsContainerProps {
  activity: Activity;
  organizations: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityDetailsContainer({
  activity,
  organizations,
  clusters = [],
  projects = [],
}: ActivityDetailsContainerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "planned":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "workshop":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "field_visit":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  const getClusterName = (clusterId: string | null) => {
    if (!clusterId) return null;
    const cluster = clusters.find(c => c.id === clusterId);
    return cluster?.name || "Unknown Cluster";
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {activity.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {activity.description}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <EditIcon className="mr-2 h-4 w-4" />
          Edit Activity
        </Button>
      </div>

      {/* Status and Type Badges */}
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(activity.status)} variant="secondary">
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </Badge>
        <Badge className={getTypeColor(activity.type)} variant="outline">
          {activity.type.replace("_", " ").charAt(0).toUpperCase() +
            activity.type.replace("_", " ").slice(1)}
        </Badge>
      </div>

      {/* Key Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Start Date
              </p>
              <p className="text-2xl font-bold">
                {format(new Date(activity.startDate), "MMM dd")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <ClockIcon className="mr-3 h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Duration
              </p>
              <p className="text-2xl font-bold">
                {activity.endDate
                  ? `${Math.ceil(
                      (new Date(activity.endDate).getTime() -
                        new Date(activity.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days`
                  : "Ongoing"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSignIcon className="mr-3 h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Budget
              </p>
              <p className="text-2xl font-bold">
                {activity.budget ? formatCurrency(activity.budget) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UsersIcon className="mr-3 h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Participants
              </p>
              <p className="text-2xl font-bold">
                {activity.numberOfParticipants || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <BuildingIcon className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Organization</p>
                <p className="text-muted-foreground text-sm">
                  {getOrganizationName(activity.organization_id)}
                </p>
              </div>
            </div>

            {activity.cluster_id && (
              <div className="flex items-center">
                <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Cluster</p>
                  <p className="text-muted-foreground text-sm">
                    {getClusterName(activity.cluster_id)}
                  </p>
                </div>
              </div>
            )}

            {activity.project_id && (
              <div className="flex items-center">
                <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-muted-foreground text-sm">
                    {getProjectName(activity.project_id)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <MapPinIcon className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-muted-foreground text-sm">
                  {activity.venue || "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(activity.startDate), "PPP")}
                  {activity.endDate &&
                    ` - ${format(new Date(activity.endDate), "PPP")}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.objectives ? (
              <p className="text-sm leading-relaxed">{activity.objectives}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                No additional notes provided.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Concept Note Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileTextIcon className="mr-2 h-5 w-5" />
              Concept Note
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                /* TODO: Open concept note dialog */
              }}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              {activity.conceptNote ? "Edit" : "Add"} Concept Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activity.conceptNote ? (
            <div className="space-y-3">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm">{activity.conceptNote}</p>
              </div>
              <div className="text-muted-foreground flex items-center text-sm">
                <CalendarIcon className="mr-1 h-3 w-3" />
                Added{" "}
                {activity.created_at
                  ? format(new Date(activity.created_at), "PPP")
                  : "Unknown"}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FolderIcon className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No concept note
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Add a concept note to provide context and planning details for
                this activity.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Report Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TargetIcon className="mr-2 h-5 w-5" />
              Activity Report
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                /* TODO: Open activity report dialog */
              }}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              {activity.activityReport ? "Edit" : "Add"} Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activity.activityReport ||
          activity.outcomes ||
          activity.challenges ||
          activity.recommendations ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Participants</p>
                      <p className="text-muted-foreground text-sm">
                        {activity.numberOfParticipants || 0} people
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">
                        Actual End Date
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {activity.endDate
                          ? format(new Date(activity.endDate), "PPP")
                          : "Ongoing"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Outcomes</p>
                      <p className="text-muted-foreground text-sm">
                        {activity.outcomes}
                      </p>
                    </div>
                    {activity.challenges && (
                      <div>
                        <p className="mb-2 text-sm font-medium">Challenges</p>
                        <p className="text-muted-foreground text-sm">
                          {activity.challenges}
                        </p>
                      </div>
                    )}
                    {activity.recommendations && (
                      <div>
                        <p className="mb-2 text-sm font-medium">
                          Recommendations
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {activity.recommendations}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <TargetIcon className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No activity report
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Add a detailed report about this activity's outcomes and impact.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance List Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              Attendance List
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  /* TODO: Export attendance list */
                }}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  /* TODO: Open attendance dialog */
                }}
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Manage Attendance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activity.attendanceList && activity.attendanceList.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {activity.attendanceList.length} participants registered
                </span>
                <span className="text-muted-foreground">
                  {activity.attendanceList.filter(p => p.attended).length}{" "}
                  attended
                </span>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {activity.attendanceList
                  .slice(0, 5)
                  .map((participant, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                          <span className="text-xs font-medium">
                            {participant.name
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {participant.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={participant.attended ? "default" : "secondary"}
                      >
                        {participant.attended ? "Attended" : "Registered"}
                      </Badge>
                    </div>
                  ))}
                {activity.attendanceList.length > 5 && (
                  <div className="py-2 text-center">
                    <Button variant="ghost" size="sm">
                      View all participants
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <UsersIcon className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No attendance records
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Start by adding participants and tracking attendance for this
                activity.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ActivityFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        activity={activity}
        organizations={organizations}
        clusters={clusters}
        projects={projects}
      />
    </div>
  );
}
