"use client";

import { useState } from "react";
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
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarGroup className="">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Admin
            <ChevronDown className="text-primary/70 ml-auto transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem className="" key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className="data-[active=true]:from-primary/20 data-[active=true]:to-primary/10 data-[active=true]:text-primary hover:from-primary/10 hover:to-primary/5 transition-all duration-200 hover:bg-gradient-to-r data-[active=true]:bg-gradient-to-r"
                  >
                    <Link
                      className="flex items-center gap-3 text-lg group-data-[state=closed]/collapsible:mx-4"
                      href={item.url}
                    >
                      {item.icon && <item.icon className="text-primary/80" />}
                      <span>{item.title}</span>
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
