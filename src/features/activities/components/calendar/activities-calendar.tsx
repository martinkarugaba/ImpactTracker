"use client";

import { useState, useMemo } from "react";
import { addDays, setHours, setMinutes, getDay } from "date-fns";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import { ActivitiesCalendarSidebar } from "./activities-calendar-sidebar";

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

// Sample activity-based events
const getSampleActivityEvents = (): CalendarEvent[] => {
  const currentDate = new Date();
  const getDaysUntilNextSunday = (date: Date) => {
    const day = getDay(date);
    return day === 0 ? 0 : 7 - day;
  };
  const daysUntilNextSunday = getDaysUntilNextSunday(currentDate);

  return [
    {
      id: "activity-1",
      title: "VSLA Training Session",
      description: "Monthly VSLA group training on financial literacy",
      start: setMinutes(
        setHours(addDays(currentDate, -7 + daysUntilNextSunday), 9),
        0
      ),
      end: setMinutes(
        setHours(addDays(currentDate, -7 + daysUntilNextSunday), 12),
        0
      ),
      color: "blue",
      location: "Community Center - Kampala",
    },
    {
      id: "activity-2",
      title: "Field Visit - Mukono",
      description: "Site visit to assess project progress",
      start: setMinutes(
        setHours(addDays(currentDate, -5 + daysUntilNextSunday), 8),
        30
      ),
      end: setMinutes(
        setHours(addDays(currentDate, -5 + daysUntilNextSunday), 17),
        0
      ),
      color: "orange",
      location: "Mukono District",
    },
    {
      id: "activity-3",
      title: "Participant Workshop",
      description: "Skills development workshop for participants",
      start: setMinutes(
        setHours(addDays(currentDate, -3 + daysUntilNextSunday), 10),
        0
      ),
      end: setMinutes(
        setHours(addDays(currentDate, -3 + daysUntilNextSunday), 16),
        0
      ),
      color: "violet",
      location: "Training Hall",
    },
    {
      id: "activity-4",
      title: "Monthly Report Due",
      description: "Submit monthly activity reports",
      start: setMinutes(
        setHours(addDays(currentDate, 2 + daysUntilNextSunday), 9),
        0
      ),
      end: setMinutes(
        setHours(addDays(currentDate, 2 + daysUntilNextSunday), 17),
        0
      ),
      color: "rose",
      allDay: true,
    },
    {
      id: "activity-5",
      title: "Team Meeting",
      description: "Weekly team coordination meeting",
      start: setMinutes(
        setHours(addDays(currentDate, 4 + daysUntilNextSunday), 14),
        0
      ),
      end: setMinutes(
        setHours(addDays(currentDate, 4 + daysUntilNextSunday), 15),
        30
      ),
      color: "emerald",
      location: "Office Conference Room",
    },
  ];
};

interface ActivitiesCalendarProps {
  className?: string;
}

export function ActivitiesCalendar({ className }: ActivitiesCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(
    getSampleActivityEvents()
  );
  const { isColorVisible } = useCalendarContext();

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return events.filter(event => isColorVisible(event.color));
  }, [events, isColorVisible]);

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, { ...event, id: `activity-${Date.now()}` }]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

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
