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
          <div className="sticky top-0 z-40 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        )}
        <form onSubmit={onSubmit} className={cn("flex-1 p-4", className)}>
          <div className="space-y-4">{children}</div>
        </form>
        {actions && (
          <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <div className={cn(isMobile && "touch-target")}>{children}</div>
      {error && (
        <p className={cn("text-sm text-destructive", isMobile && "text-base")}>
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
