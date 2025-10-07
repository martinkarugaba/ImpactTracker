import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { NavigationProvider } from "@/features/dashboard/contexts/navigation-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <NavigationProvider>
      <CalendarProvider>
        <SidebarProvider>
          <AppSidebar className="bg-sidebar dark:bg-gray-900" />
          <SidebarInset className="flex min-h-screen flex-1 flex-col border-none">
            <SiteHeader />
            <main className="flex-1 rounded-b-2xl bg-white px-2 pt-0 pb-2 md:px-3 md:pb-3 lg:px-0 dark:bg-[#0A0A0A]">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </CalendarProvider>
    </NavigationProvider>
  );
}
