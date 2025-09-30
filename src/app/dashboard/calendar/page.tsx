import { Metadata } from "next";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { CalendarProvider } from "@/features/event-calendar/calendar-context";
import { EventCalendar } from "@/features/event-calendar/event-calendar";

export const metadata: Metadata = {
  title: "Calendar - KPI Edge",
  description: "Event calendar for managing activities and sessions",
};

export default function CalendarPage() {
  return (
    <>
      <PageTitle title="Calendar" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <div className="mb-4">
              <p className="text-muted-foreground">
                Manage your activities, sessions, and events in a calendar view.
              </p>
            </div>
            <CalendarProvider>
              <div className="min-h-[600px] w-full">
                <EventCalendar />
              </div>
            </CalendarProvider>
          </div>
        </div>
      </div>
    </>
  );
}
