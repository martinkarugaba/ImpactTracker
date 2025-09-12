"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/features/themes/components/mode-toggle";
import { ThemeSelector } from "@/features/themes/components/theme-selector";
import { Separator } from "@/components/ui/separator";
import { usePageTitle } from "@/features/dashboard/contexts/page-title-context";

interface SiteHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
  text?: string;
  title?: string;
  children?: React.ReactNode;
}

export function SiteHeader({
  children,
  className,
  ...props
}: Omit<SiteHeaderProps, "title">) {
  const { title } = usePageTitle();

  return (
    <header
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full rounded-none border-b backdrop-blur transition-[margin] duration-200 ease-linear group-data-[state=collapsed]:ml-0 md:rounded-t-2xl md:group-data-[state=expanded]:ml-64",
        "px-2 sm:px-4 md:px-6",
        className
      )}
      {...props}
    >
      <div className="container flex h-8 items-center md:h-14">
        {/* Mobile: Show sidebar trigger and title */}
        <div className="flex items-center gap-3 md:hidden">
          <SidebarTrigger />
          <h1 className="text-lg font-medium">{title}</h1>
        </div>
        {/* Desktop: Show full header */}
        <div className="hidden md:flex">
          <SidebarTrigger />
        </div>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-1 flex-col justify-center md:flex-row md:items-center md:justify-between">
          <div className="container hidden py-2 md:block md:py-2">
            <h1 className="text-lg font-medium">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeSelector />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
