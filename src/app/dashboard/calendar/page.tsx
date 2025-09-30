import { Metadata } from "next";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { EventCalendar } from "@/features/event-calendar/event-calendar";

export const metadata: Metadata = {
  title: "Calendar - KPI Edge",
  description: "Event calendar for managing activities and sessions",
};

export default function CalendarPage() {
  return (
    <>
      <PageTitle title="Calendar" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 p-4">
          <div className="mb-2">
            <p className="text-muted-foreground">
              Manage your activities, sessions, and events in a calendar view.
            </p>
          </div>

          <div className="min-h-[calc(100vh-200px)] w-full">
            <EventCalendar />
          </div>
        </div>
      </div>
    </>
  );
}
