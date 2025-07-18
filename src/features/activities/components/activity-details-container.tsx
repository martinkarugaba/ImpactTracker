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
            onClick={() => router.push("/dashboard/activities")}
            className="hover:bg-muted"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Activities
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Activity Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(activity.type)}>
                  {activity.type.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{activity.title}</CardTitle>
              {activity.description && (
                <p className="text-muted-foreground max-w-3xl">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Activity Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <ClockIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(activity.startDate), "PPP")}
                </p>
              </div>
            </div>

            {activity.endDate && (
              <div className="flex items-center space-x-3">
                <ClockIcon className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(activity.endDate), "PPP")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <MapPinIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Venue</p>
                <p className="text-muted-foreground text-sm">
                  {activity.venue}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UsersIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-muted-foreground text-sm">
                  {activity.numberOfParticipants || 0} registered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization & Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingIcon className="mr-2 h-5 w-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <BuildingIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Organization</p>
                <p className="text-muted-foreground text-sm">
                  {getOrganizationName(activity.organization_id)}
                </p>
              </div>
            </div>

            {activity.cluster_id && (
              <div className="flex items-center space-x-3">
                <TargetIcon className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Cluster</p>
                  <p className="text-muted-foreground text-sm">
                    {getClusterName(activity.cluster_id)}
                  </p>
                </div>
              </div>
            )}

            {activity.project_id && (
              <div className="flex items-center space-x-3">
                <FolderIcon className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-muted-foreground text-sm">
                    {getProjectName(activity.project_id)}
                  </p>
                </div>
              </div>
            )}

            {activity.budget && (
              <div className="flex items-center space-x-3">
                <DollarSignIcon className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-muted-foreground text-sm">
                    {formatCurrency(activity.budget)}
                  </p>
                </div>
              </div>
            )}

            {activity.actualCost && (
              <div className="flex items-center space-x-3">
                <DollarSignIcon className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Actual Cost</p>
                  <p className="text-muted-foreground text-sm">
                    {formatCurrency(activity.actualCost)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Objectives */}
      {activity.objectives && activity.objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5">
              {activity.objectives.map((objective, index) => (
                <li key={index} className="text-sm">
                  {objective}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {(activity.outcomes ||
        activity.challenges ||
        activity.recommendations) && (
        <div className="grid gap-6 md:grid-cols-1">
          {activity.outcomes && (
            <Card>
              <CardHeader>
                <CardTitle>Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{activity.outcomes}</p>
              </CardContent>
            </Card>
          )}

          {activity.challenges && (
            <Card>
              <CardHeader>
                <CardTitle>Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{activity.challenges}</p>
              </CardContent>
            </Card>
          )}

          {activity.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{activity.recommendations}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Activity Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Created By</p>
              <p className="text-muted-foreground text-sm">
                {activity.created_by}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Created At</p>
              <p className="text-muted-foreground text-sm">
                {activity.created_at
                  ? format(new Date(activity.created_at), "PPP 'at' p")
                  : "N/A"}
              </p>
            </div>
            {activity.updated_at && (
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(activity.updated_at), "PPP 'at' p")}
                </p>
              </div>
            )}
          </div>
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
