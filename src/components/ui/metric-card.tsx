import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number | ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  footer?: {
    title: string;
    description: string;
  };
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  footer,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              {icon}
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {footer.title} {icon}
          </div>
          <div className="text-muted-foreground">{footer.description}</div>
        </CardFooter>
      )}
    </Card>
  );
}
