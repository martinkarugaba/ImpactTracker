"use client";

import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { data: session } = useSession();

  // Filter out success stories for non-super admin users
  const isSuperAdmin = session?.user?.role === "super_admin";
  const filteredItems = items.filter(item => {
    if (item.name === "Success stories" && !isSuperAdmin) {
      return false;
    }
    return true;
  });

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
            My KPIs
            <ChevronDown className="text-emerald-500 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="ml-2 space-y-1 border-l-2 border-emerald-300/30 pl-4 dark:border-emerald-600/30">
            <SidebarMenu>
              {filteredItems.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className="border-l-2 border-transparent transition-all duration-200 hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 dark:hover:border-emerald-600 dark:hover:from-emerald-900/20 dark:hover:to-blue-900/20"
                  >
                    <Link
                      href={item.url}
                      title={item.name}
                      className="flex items-center gap-3"
                    >
                      {item.icon && (
                        <item.icon className="text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span className="text-foreground/90 hover:text-foreground">
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
