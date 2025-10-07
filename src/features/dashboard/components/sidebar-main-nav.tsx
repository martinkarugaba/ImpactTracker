"use client";

import { useSession } from "next-auth/react";
import { NavMain } from "./nav-admin";
import { NavDocuments } from "./nav-kpis";
import { NavSecondary } from "./nav-secondary";
import { navigationData } from "../data/sidebar-navigation";

export function SidebarMainNav() {
  const { data: session } = useSession();

  // Only show admin navigation for super_admin and cluster_manager roles
  const canAccessAdmin =
    session?.user?.role === "super_admin" ||
    session?.user?.role === "cluster_manager";

  return (
    <>
      {canAccessAdmin && <NavMain items={navigationData.navMain} />}
      <NavDocuments items={navigationData.kpis} />
      <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
    </>
  );
}
