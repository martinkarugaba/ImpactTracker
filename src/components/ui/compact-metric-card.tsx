import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface CompactMetricCardProps {
  title: string;
  value?: string | number;
  count?: number;
  percent?: number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  className?: string;
  isLoading?: boolean;
  iconColor?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function CompactMetricCard({
  title,
  value,
  count,
  percent,
  subtitle,
  trend,
  icon,
  className,
  isLoading = false,
  iconColor = "text-primary",
  onClick,
  isActive = false,
}: CompactMetricCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/50 p-4",
        onClick && "cursor-pointer transition-colors hover:bg-accent",
        isActive && "border-primary bg-accent",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="w-full">
        <div className="w-full space-y-1">
          <div className="flex items-center gap-2">
            {icon && (
              <div className={cn("rounded-full p-1.5", `${iconColor}/10`)}>
                <div className={cn(iconColor)}>{icon}</div>
              </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="flex w-full flex-col">
              {count !== undefined && percent !== undefined ? (
                <div className="flex w-full items-baseline justify-between">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {count}
                  </p>
                  <div className="flex items-center gap-1">
                    {percent > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : percent < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : null}
                    <p
                      className={cn(
                        "text-sm font-medium",
                        percent > 0
                          ? "text-green-500"
                          : percent < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                      )}
                    >
                      {percent}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex w-full items-center justify-between">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {value}
                  </p>
                  {subtitle && (
                    <span className="text-sm text-muted-foreground">
                      {subtitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          {trend && !isLoading && (
            <div className="flex items-center text-xs">
              <span
                className={cn(
                  "flex items-center gap-0.5",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-muted-foreground">vs. previous</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
