import { type CalendarEvent } from "@/components/event-calendar/types";
import { type Activity } from "../../types/types";

/**
 * Maps activity data to calendar event format
 */
export function mapActivityToCalendarEvent(activity: Activity): CalendarEvent {
  // Map activity type to color
  const getColorFromType = (type: string): string => {
    switch (type.toLowerCase()) {
      case "training":
        return "blue";
      case "meeting":
        return "emerald";
      case "workshop":
        return "violet";
      case "field work":
      case "fieldwork":
        return "orange";
      case "reporting":
        return "rose";
      default:
        return "blue";
    }
  };

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description || "",
    start: new Date(activity.startDate),
    end: new Date(activity.endDate),
    color: getColorFromType(activity.type || ""),
    location: activity.venue || "",
    allDay: false, // You might want to determine this based on time
  };
}

/**
 * Maps calendar event back to activity data for updates
 */
export function mapCalendarEventToActivity(
  event: CalendarEvent,
  clusterId?: string
): Partial<Activity> {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.start,
    endDate: event.end,
    venue: event.location,
    cluster_id: clusterId,
    // Add other required fields with defaults or from existing data
  };
}

/**
 * Helper to get activity type from color
 */
export function getActivityTypeFromColor(color: string): string {
  switch (color) {
    case "blue":
      return "training";
    case "emerald":
      return "meeting";
    case "violet":
      return "workshop";
    case "orange":
      return "field work";
    case "rose":
      return "reporting";
    default:
      return "training";
  }
}
