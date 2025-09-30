import { Metadata } from "next";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import { EventCalendar } from "@/components/event-calendar/event-calendar";

export const metadata: Metadata = {
  title: "Calendar - KPI Edge",
  description: "Event calendar for managing activities and sessions",
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Manage your activities, sessions, and events in a calendar view.
        </p>
      </div>

      <CalendarProvider>
        <div className="h-[calc(100vh-12rem)]">
          <EventCalendar />
        </div>
      </CalendarProvider>
    </div>
  );
}
