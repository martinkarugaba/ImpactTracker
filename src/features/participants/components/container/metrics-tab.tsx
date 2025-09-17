"use client";

import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, Eye } from "lucide-react";
import { ParticipantDemographicsAnalytics } from "../metrics/participant-demographics-analytics";
import { SimplifiedParticipantAnalytics } from "../metrics/simplified-participant-analytics";
import { type Participant } from "../../types/types";

interface AnalyticsTabProps {
  metricsParticipants: Participant[];
  isMetricsLoading: boolean;
}

export function AnalyticsTab({
  metricsParticipants,
  isMetricsLoading,
}: AnalyticsTabProps) {
  const [viewMode, setViewMode] = useState<"simplified" | "detailed">(
    "simplified"
  );

  return (
    <TabsContent value="analytics" className="mt-6">
      {/* Colorful Analytics Container */}
      <div className="space-y-8 rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Participant Analytics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive insights and demographics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {metricsParticipants.length} participants
            </Badge>
            <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm dark:bg-gray-800">
              <Button
                variant={viewMode === "simplified" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("simplified")}
                className="text-xs"
              >
                <Eye className="mr-1 h-3 w-3" />
                Simplified
              </Button>
              <Button
                variant={viewMode === "detailed" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("detailed")}
                className="text-xs"
              >
                <Settings className="mr-1 h-3 w-3" />
                Detailed
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        {viewMode === "simplified" ? (
          <SimplifiedParticipantAnalytics
            participants={metricsParticipants}
            isLoading={isMetricsLoading}
          />
        ) : (
          <ParticipantDemographicsAnalytics
            participants={metricsParticipants}
            isLoading={isMetricsLoading}
          />
        )}
      </div>
    </TabsContent>
  );
}
