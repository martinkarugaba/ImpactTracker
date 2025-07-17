"use client";

import { useSession } from "next-auth/react";
import { navigationData } from "../data/sidebar-navigation";
import { NavMain } from "./nav-admin";
import { NavDocuments } from "./nav-kpis";
import { NavSecondary } from "./nav-secondary";

export function SidebarMainNav() {
  const { data: session } = useSession();

  // Only show the main navigation if user has super_admin role
  const isSuperAdmin = session?.user?.role === "super_admin";

  if (!isSuperAdmin) {
    return (
      <>
        <NavDocuments items={navigationData.kpis} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </>
    );
  }

  return (
    <>
      <NavMain items={navigationData.navMain} />
      <NavDocuments items={navigationData.kpis} />
      <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
    </>
  );
}
