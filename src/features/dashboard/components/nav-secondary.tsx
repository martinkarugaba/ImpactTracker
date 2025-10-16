"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";
import { IconBrightness } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { setTheme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Filter out Profile link for non-super-admin users
  const filteredItems = items.filter(item => {
    if (item.title === "Profile") {
      return session?.user?.role === "super_admin";
    }
    return true;
  });

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20"
              >
                <Link
                  href={item.url}
                  title={item.title}
                  className="flex items-center gap-3"
                >
                  {item.icon && (
                    <item.icon className="text-purple-600 dark:text-purple-400" />
                  )}
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuButton
              asChild
              className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <IconBrightness className="text-amber-600 dark:text-amber-400" />
                <span className="text-muted-foreground transition-colors hover:text-foreground">
                  Dark Mode
                </span>
                {mounted ? (
                  <Switch
                    className="ml-auto"
                    checked={resolvedTheme !== "light"}
                    onCheckedChange={() =>
                      setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    }
                  />
                ) : (
                  <Skeleton className="ml-auto h-4 w-8 rounded-full" />
                )}
              </label>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
