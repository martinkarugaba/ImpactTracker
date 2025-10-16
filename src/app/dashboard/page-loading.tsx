"use client";

import { Loader2, LayoutDashboard } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
      <div className="flex animate-in flex-col items-center gap-4 rounded-lg bg-card p-8 opacity-0 shadow-lg duration-300 fade-in">
        <div className="relative">
          <LayoutDashboard className="absolute h-10 w-10 text-muted-foreground opacity-10" />
          <div className="animate-spin text-primary">
            <Loader2 className="h-12 w-12" />
          </div>
        </div>
        <div className="flex animate-in flex-col items-center gap-1 delay-200 duration-300 fade-in slide-in-from-bottom-2">
          <h3 className="text-xl font-semibold text-primary">
            Loading Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Preparing your analytics and insights...
          </p>
        </div>

        <div
          className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-primary/20"
          style={{ maxWidth: "200px" }}
        >
          <div
            className="absolute top-0 left-0 h-full animate-pulse rounded-full bg-primary"
            style={{ width: "30%" }}
          />
        </div>
      </div>
    </div>
  );
}
