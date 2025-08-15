"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileFormProps {
  title?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  actions?: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function MobileForm({
  title,
  children,
  onSubmit,
  actions,
  className,
  fullHeight = false,
}: MobileFormProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("flex flex-col", fullHeight && "min-h-screen")}>
        {title && (
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b px-4 py-3 backdrop-blur">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        )}
        <form onSubmit={onSubmit} className={cn("flex-1 p-4", className)}>
          <div className="space-y-4">{children}</div>
        </form>
        {actions && (
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 border-t p-4 backdrop-blur">
            <div className="flex gap-2">{actions}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          {actions && <div className="flex gap-2 pt-4">{actions}</div>}
        </form>
      </CardContent>
    </Card>
  );
}

interface MobileFormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}

export function MobileFormField({
  label,
  children,
  required,
  error,
  className,
}: MobileFormFieldProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("space-y-2", className)}>
      <label className={cn("text-sm font-medium", isMobile && "text-base")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className={cn(isMobile && "touch-target")}>{children}</div>
      {error && (
        <p className={cn("text-destructive text-sm", isMobile && "text-base")}>
          {error}
        </p>
      )}
    </div>
  );
}

interface MobileFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFormActions({
  children,
  className,
}: MobileFormActionsProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex gap-2",
        isMobile ? "flex-col space-y-2" : "flex-row",
        className
      )}
    >
      {children}
    </div>
  );
}
