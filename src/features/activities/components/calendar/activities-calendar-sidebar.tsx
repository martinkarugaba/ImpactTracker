"use client";

import * as React from "react";
import { RiCheckLine } from "@remixicon/react";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import { activityTypes } from "./activities-calendar";

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Checkbox } from "@/components/ui/checkbox";

export function ActivitiesCalendarSidebar() {
  const { isColorVisible, toggleColorVisibility } = useCalendarContext();

  return (
    <div className="border-l bg-background" style={{ width: "280px" }}>
      <SidebarContent className="mt-3 gap-0 border-t pt-3">
        <SidebarGroup className="px-1">
          <SidebarCalendar />
        </SidebarGroup>
        <SidebarGroup className="mt-3 border-t px-1 pt-4">
          <SidebarGroupLabel className="text-muted-foreground/65 uppercase">
            Activity Types
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {activityTypes.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    className="relative justify-between rounded-md has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 [&>svg]:size-auto"
                  >
                    <span>
                      <span className="flex items-center justify-between gap-3 font-medium">
                        <Checkbox
                          id={item.id}
                          className="peer sr-only"
                          checked={isColorVisible(item.color)}
                          onCheckedChange={() =>
                            toggleColorVisibility(item.color)
                          }
                        />
                        <RiCheckLine
                          className="peer-not-data-[state=checked]:invisible"
                          size={16}
                          aria-hidden="true"
                        />
                        <label
                          htmlFor={item.id}
                          className="peer-not-data-[state=checked]:text-muted-foreground/65 peer-not-data-[state=checked]:line-through after:absolute after:inset-0"
                        >
                          {item.name}
                        </label>
                      </span>
                      <span
                        className="size-1.5 rounded-full bg-(--event-color)"
                        style={
                          {
                            "--event-color": `var(--color-${item.color}-400)`,
                          } as React.CSSProperties
                        }
                      ></span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
}
