"use client";

import { useAtom } from "jotai";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  importProgressAtom,
  isImportingAtom,
  resetImportAtom,
} from "../../atoms/import-progress-atoms";

export function GlobalImportProgress() {
  const [progress] = useAtom(importProgressAtom);
  const [isImporting] = useAtom(isImportingAtom);
  const [, resetImport] = useAtom(resetImportAtom);
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't show if no import is active or completed recently
  if (progress.status === "idle") {
    return null;
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diffMs = endTime.getTime() - start.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case "importing":
        return <Upload className="h-4 w-4 animate-pulse text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case "importing":
        return "border-blue-200 bg-blue-50";
      case "completed":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className={cn("shadow-lg", getStatusColor())}
        >
          {getStatusIcon()}
          <span className="ml-2">
            {progress.status === "importing"
              ? `${progress.percentage}%`
              : progress.status === "completed"
                ? "Completed"
                : "Error"}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className={cn("shadow-lg", getStatusColor())}>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">Import Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <span className="sr-only">Minimize</span>
                <div className="h-3 w-3 border border-gray-400"></div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetImport}
                className="h-6 w-6 p-0"
                disabled={isImporting}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {progress.message && (
            <p className="mb-2 text-xs text-gray-600">{progress.message}</p>
          )}

          {progress.error && (
            <p className="mb-2 text-xs text-red-600">{progress.error}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {progress.current} of {progress.total} participants
              </span>
              <span>{progress.percentage}%</span>
            </div>

            <Progress value={progress.percentage} className="h-2" />

            {progress.totalBatches > 1 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Batch {progress.currentBatch} of {progress.totalBatches}
                </span>
                {progress.startTime && (
                  <span>
                    {formatDuration(progress.startTime, progress.endTime)}
                  </span>
                )}
              </div>
            )}
          </div>

          {progress.status === "completed" && (
            <div className="mt-3 text-xs text-green-700">
              ✅ Import completed successfully!
              {progress.startTime && progress.endTime && (
                <span className="block">
                  Total time:{" "}
                  {formatDuration(progress.startTime, progress.endTime)}
                </span>
              )}
            </div>
          )}

          {progress.status === "error" && (
            <div className="mt-3 text-xs text-red-700">
              ❌ Import failed. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
