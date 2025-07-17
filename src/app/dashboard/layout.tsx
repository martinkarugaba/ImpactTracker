import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="bg-sidebar flex min-h-screen w-full py-2 pr-2">
        <AppSidebar variant="sidebar" collapsible="icon" />
        <div className="bg-background relative w-full flex-1 overflow-hidden rounded-2xl border-white transition-[margin] duration-200 ease-linear group-data-[state=collapsed]:ml-0 group-data-[state=expanded]:ml-64 dark:bg-black/60">
          <main className="border-sidebar-accent flex-1 p-3 pt-0 lg:px-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
