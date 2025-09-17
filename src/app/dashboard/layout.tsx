import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { NavigationProvider } from "@/features/dashboard/contexts/navigation-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <NavigationProvider>
      <SidebarProvider>
        <div className="bg-sidebar flex min-h-screen w-full py-2 pr-0 md:pr-2 md:pb-2">
          <AppSidebar variant="sidebar" collapsible="icon" />
          <div className="bg-background relative w-full flex-1 overflow-hidden rounded-none border-white transition-[margin] duration-200 ease-linear group-data-[state=collapsed]:ml-0 group-data-[state=expanded]:ml-0 md:rounded-2xl md:group-data-[state=expanded]:ml-64 dark:bg-black/60">
            <SiteHeader />
            <main className="border-sidebar-accent flex-1 px-2 pt-0 pb-2 md:px-3 md:pb-3 lg:px-0">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NavigationProvider>
  );
}
