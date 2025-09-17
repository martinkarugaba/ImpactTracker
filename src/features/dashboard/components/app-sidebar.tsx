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
      className="from-background via-background/95 to-background/90 sticky top-0 h-screen overflow-hidden border-none bg-gradient-to-b backdrop-blur-sm"
      collapsible="icon"
      {...props}
    >
      {/* Subtle background pattern */}
      <div className="bg-grid-small-primary/[0.02] pointer-events-none absolute inset-0" />
      <div className="from-primary/[0.03] to-primary/[0.01] pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

      <SidebarHeader className="from-primary/10 via-primary/5 border-primary/20 border-b bg-gradient-to-r to-transparent">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="via-muted/30 bg-gradient-to-b from-transparent to-transparent">
        <SidebarMainNav />
      </SidebarContent>
      <SidebarFooter className="from-muted/20 via-muted/10 border-border/50 border-t bg-gradient-to-r to-transparent">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
