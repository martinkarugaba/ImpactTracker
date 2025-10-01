"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavUser } from "./nav-user";
import { SidebarMainNav } from "./sidebar-main-nav";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur"
      collapsible="offcanvas"
      side="left"
      {...props}
    >
      {/* Subtle background pattern */}
      <div className="bg-grid-small-primary/[0.02] pointer-events-none absolute inset-0" />
      <div className="from-primary/[0.03] to-primary/[0.01] pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

      <SidebarHeader className="border-border/20 flex-shrink-0 border-b">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMainNav />
      </SidebarContent>
      <SidebarFooter className="border-border/50 flex-shrink-0 border-t">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
