import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { NavigationProvider } from "@/features/dashboard/contexts/navigation-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Verify user exists in database
  if (session.user?.id) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });

      // If user doesn't exist in database but has a session, redirect to login
      // This handles cases where user was deleted or session is stale
      if (!user) {
        console.error(
          `User ${session.user.id} not found in database. Redirecting to login.`
        );
        redirect("/auth/login?error=session_expired");
      }
    } catch (error) {
      console.error("Error verifying user in database:", error);
      // Redirect to login on database errors
      redirect("/auth/login?error=database_error");
    }
  }

  return (
    <NavigationProvider>
      <CalendarProvider>
        <SidebarProvider>
          <div
            className="flex min-h-screen w-full bg-[#FAFAFA] dark:bg-neutral-900"
            suppressHydrationWarning
          >
            <AppSidebar className="w-[90%] lg:w-[20%]" />
            <SidebarInset className="lg:w-[80%] lg:max-w-[80%]">
              <div className="flex flex-1 flex-col rounded-2xl bg-white dark:bg-[#0a0a0a] ">
                <SiteHeader />
                <main className="flex-1 rounded-b-2xl bg-transparent px-2 pt-0 pb-2 md:px-3 md:pb-3 lg:px-0 overflow-hidden">
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
