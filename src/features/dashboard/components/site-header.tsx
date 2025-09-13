"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/features/themes/components/mode-toggle";
import { ThemeSelector } from "@/features/themes/components/theme-selector";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/features/dashboard/contexts/navigation-context";
import { ArrowLeft } from "lucide-react";

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
  const { breadcrumbs, showBackButton, goBack } = useNavigation();

  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    const items = breadcrumbs.map((item, index) => (
      <React.Fragment key={index}>
        <BreadcrumbItem>
          {item.isCurrentPage ? (
            <BreadcrumbPage className="flex items-center justify-start">
              {item.icon && <div className="mr-2">{item.icon}</div>}
              <div className="flex-1">{item.label}</div>
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link
                href={item.href || "#"}
                className="flex inline-block items-center justify-start"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
      </React.Fragment>
    ));

    // If too many items, show ellipsis
    if (items.length > 5) {
      const visibleItems = [
        items[0], // First item
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="ellipsis">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center">
              <BreadcrumbEllipsis className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {breadcrumbs.slice(1, -2).map((item, index) => (
                <DropdownMenuItem key={index}>
                  <Link href={item.href || "#"} className="flex items-center">
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="sep2" />,
        ...items.slice(-2), // Last two items
      ];

      return (
        <Breadcrumb>
          <BreadcrumbList>{visibleItems}</BreadcrumbList>
        </Breadcrumb>
      );
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>{items}</BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <header
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full rounded-none border-b backdrop-blur transition-[margin] duration-200 ease-linear group-data-[state=collapsed]:ml-0 md:rounded-t-2xl md:group-data-[state=expanded]:ml-64",
        "px-2 sm:px-4 md:px-6",
        className
      )}
      {...props}
    >
      <div className="container flex h-14 items-center">
        {/* Mobile: Show sidebar trigger and back button */}
        <div className="flex items-center gap-2 md:hidden">
          <SidebarTrigger />
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
        </div>

        {/* Desktop: Show sidebar trigger and back button */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <SidebarTrigger />
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="h-8 gap-2 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <Separator orientation="vertical" className="mx-3 h-4" />

        <div className="flex flex-1 items-center justify-between">
          {/* Navigation section */}
          <div className="flex flex-1 flex-col gap-1">
            {/* Breadcrumbs - show on desktop or when no back button on mobile */}
            <div
              className={cn(
                "flex items-center",
                showBackButton ? "hidden md:flex" : "flex"
              )}
            >
              {renderBreadcrumbs()}
            </div>
          </div>

          {/* Theme controls */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeSelector />
            <ModeToggle />
          </div>
        </div>

        {/* Custom header content */}
        {children && (
          <>
            <Separator orientation="vertical" className="mx-3 h-4" />
            <div className="flex items-center gap-2">{children}</div>
          </>
        )}
      </div>
    </header>
  );
}
