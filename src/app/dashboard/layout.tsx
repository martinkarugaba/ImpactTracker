import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { NavigationProvider } from "@/features/dashboard/contexts/navigation-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
// import { CalendarProvider } from "@/features/event-calendar/calendar-context";

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
          <div className="bg-sidebar flex min-h-screen w-full gap-2 py-2 pr-0 md:pr-2 md:pb-2">
            <AppSidebar variant="sidebar" collapsible="icon" />
            <SidebarInset className="overflow-hidden rounded-2xl">
              <div className="relative w-full flex-1 overflow-hidden rounded-none border-emerald-500 transition-[margin] duration-200 ease-linear group-data-[state=collapsed]:ml-0 group-data-[state=expanded]:ml-0 md:rounded-2xl md:group-data-[state=expanded]:ml-64">
                <SiteHeader />
                <main className="flex-1 px-2 pt-0 pb-2 md:px-3 md:pb-3 lg:px-0">
                  {children}
                </main>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </CalendarProvider>
    </NavigationProvider>
  );
}
