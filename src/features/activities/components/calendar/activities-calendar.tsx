"use client";

import { useMemo } from "react";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import { ActivitiesCalendarSidebar } from "./activities-calendar-sidebar";
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from "../../hooks/use-activities";
import {
  mapActivityToCalendarEvent,
  getActivityTypeFromColor,
} from "../../utils/calendar-mapping";
import { toast } from "sonner";
import { type NewActivity } from "../../types/types";

// Activity-specific color coding
export const activityTypes = [
  {
    id: "training",
    name: "Training Sessions",
    color: "blue" as EventColor,
    isActive: true,
  },
  {
    id: "meeting",
    name: "Meetings",
    color: "emerald" as EventColor,
    isActive: true,
  },
  {
    id: "workshop",
    name: "Workshops",
    color: "violet" as EventColor,
    isActive: true,
  },
  {
    id: "fieldwork",
    name: "Field Work",
    color: "orange" as EventColor,
    isActive: true,
  },
  {
    id: "reporting",
    name: "Reporting",
    color: "rose" as EventColor,
    isActive: true,
  },
];

interface ActivitiesCalendarProps {
  className?: string;
  clusterId?: string;
}

export function ActivitiesCalendar({
  className,
  clusterId,
}: ActivitiesCalendarProps) {
  const { isColorVisible } = useCalendarContext();

  // Fetch all activities (no pagination for calendar view)
  const { data: activitiesResponse, isLoading } = useActivities(clusterId, {
    limit: 1000, // Fetch a large number to get all activities
  });

  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();

  // Convert activities to calendar events
  const events = useMemo(() => {
    if (!activitiesResponse?.data?.data) return [];
    return activitiesResponse.data.data.map(mapActivityToCalendarEvent);
  }, [activitiesResponse]);

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return events.filter(event => isColorVisible(event.color));
  }, [events, isColorVisible]);

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      // Try to get cluster_id and organization_id from existing activities or props
      let targetClusterId = clusterId;
      let targetOrganizationId: string | undefined;
      let targetProjectId: string | null = null;

      // If we have existing activities, use the first one's info
      if (
        activitiesResponse?.data?.data &&
        activitiesResponse.data.data.length > 0
      ) {
        const firstActivity = activitiesResponse.data.data[0];
        targetClusterId =
          targetClusterId || firstActivity.cluster_id || undefined;
        targetOrganizationId = firstActivity.organization_id;
        targetProjectId = firstActivity.project_id || null;
      }

      // Validate required fields
      if (!targetClusterId || !targetOrganizationId) {
        toast.error(
          "Unable to create activity: Please create your first activity from the Activities tab"
        );
        return;
      }

      const newActivity: NewActivity = {
        title: event.title,
        description: event.description || "",
        type: getActivityTypeFromColor(event.color || "blue"),
        status: "planned",
        startDate: event.start,
        endDate: event.end,
        venue: event.location || "",
        cluster_id: targetClusterId,
        organization_id: targetOrganizationId,
        project_id: targetProjectId,
        budget: null,
        actualCost: null,
        expectedSessions: null,
        numberOfParticipants: 0,
        objectives: [],
        outcomes: null,
        challenges: null,
        recommendations: null,
        attachments: [],
        created_by: "system", // You may want to get this from auth context
        skillCategory: null,
      };

      await createActivityMutation.mutateAsync(newActivity);
      toast.success("Activity created successfully");
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("Failed to create activity");
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      const updates: Partial<NewActivity> = {
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        type: getActivityTypeFromColor(updatedEvent.color || "blue"),
        startDate: updatedEvent.start,
        endDate: updatedEvent.end,
        venue: updatedEvent.location || "",
      };

      await updateActivityMutation.mutateAsync({
        id: updatedEvent.id,
        data: updates,
      });
      toast.success("Activity updated successfully");
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Failed to update activity");
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteActivityMutation.mutateAsync({ id: eventId });
      toast.success("Activity deleted successfully");
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Failed to delete activity");
    }
  };

  if (isLoading) {
    return (
      <div
        className={`flex h-full items-center justify-center ${className || ""}`}
      >
        <div className="text-center">
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${className || ""}`}>
      <div className="flex-1">
        <EventCalendar
          events={visibleEvents}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          initialView="month"
        />
      </div>
      <ActivitiesCalendarSidebar />
    </div>
  );
}
