import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { NavigationProvider } from "@/features/dashboard/contexts/navigation-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarProvider } from "@/features/event-calendar/calendar-context";

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
          <div className="bg-sidebar flex min-h-screen w-full py-2 pr-0 md:pr-2 md:pb-2">
            <AppSidebar variant="sidebar" collapsible="icon" />
            <SidebarInset>
              <SiteHeader />
              <main className="border-sidebar-accent flex-1 px-2 pt-0 pb-2 md:px-3 md:pb-3 lg:px-0">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </CalendarProvider>
    </NavigationProvider>
  );
}
