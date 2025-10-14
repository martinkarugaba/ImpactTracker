"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter out success stories for non-super admin users
  const isSuperAdmin = session?.user?.role === "super_admin";
  const filteredItems = items.filter(item => {
    if (item.name === "Success stories" && !isSuperAdmin) {
      return false;
    }
    return true;
  });

  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-primary font-semibold">
          My KPIs
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="font-medium">
            {filteredItems.map(item => (
              <SidebarMenuItem key={item.name}>
                <Skeleton className="h-8 w-full" />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="text-primary hover:text-primary/80 font-semibold transition-colors">
            My KPIs
            <ChevronDown className="text-primary/70 ml-auto transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className="hover:from-primary/10 hover:to-primary/5 transition-all duration-200 hover:bg-gradient-to-r"
                  >
                    <Link
                      href={item.url}
                      title={item.name}
                      className="flex items-center gap-3 font-medium group-data-[state=closed]/collapsible:mx-4"
                    >
                      {item.icon && <item.icon className="text-primary/80" />}
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
