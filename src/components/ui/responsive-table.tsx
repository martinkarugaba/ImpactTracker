"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface ResponsiveTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
    mobile?: boolean; // Show on mobile
    desktop?: boolean; // Show on desktop
  }[];
  actions?: (item: T) => React.ReactNode;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  className,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          <Card key={index} className="p-0">
            <CardContent className="p-4">
              <div className="space-y-2">
                {columns
                  .filter(col => col.mobile !== false)
                  .map(column => (
                    <div
                      key={String(column.key)}
                      className="flex justify-between"
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.label}:
                      </span>
                      <span className="text-sm font-medium">
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key])}
                      </span>
                    </div>
                  ))}
                {actions && (
                  <div className="flex justify-end pt-2">{actions(item)}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {columns
              .filter(col => col.desktop !== false)
              .map(column => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-sm font-medium"
                >
                  {column.label}
                </th>
              ))}
            {actions && (
              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t">
              {columns
                .filter(col => col.desktop !== false)
                .map(column => (
                  <td key={String(column.key)} className="px-4 py-3 text-sm">
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key])}
                  </td>
                ))}
              {actions && (
                <td className="px-4 py-3 text-right">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
