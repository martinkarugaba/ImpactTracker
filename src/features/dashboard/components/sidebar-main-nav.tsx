"use client";

import { NavMain } from "./nav-admin";
import { NavDocuments } from "./nav-kpis";
import { NavSecondary } from "./nav-secondary";
import { navigationData } from "../data/sidebar-navigation";

export function SidebarMainNav() {
  return (
    <>
      <NavMain items={navigationData.navMain} />
      <NavDocuments items={navigationData.kpis} />
      <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
    </>
  );
}
