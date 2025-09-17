"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface BatchProgressProps {
  progress: {
    current: number;
    total: number;
    currentBatch: number;
    totalBatches: number;
    percentage: number;
  };
  isImporting: boolean;
  isComplete?: boolean;
  hasErrors?: boolean;
}

export function BatchProgress({
  progress,
  isImporting,
  isComplete = false,
  hasErrors = false,
}: BatchProgressProps) {
  if (!isImporting && !isComplete) {
    return null;
  }

  const getStatusIcon = () => {
    if (hasErrors) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
    if (isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Upload className="h-5 w-5 text-blue-500" />;
  };

  const getStatusText = () => {
    if (hasErrors) {
      return "Import completed with some errors";
    }
    if (isComplete) {
      return "Import completed successfully";
    }
    return "Importing participants...";
  };

  const getStatusColor = () => {
    if (hasErrors) return "text-orange-700";
    if (isComplete) return "text-green-700";
    return "text-blue-700";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {getStatusIcon()}
          {getStatusText()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className={getStatusColor()}>
              {progress.current.toLocaleString()} /{" "}
              {progress.total.toLocaleString()} participants
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="text-muted-foreground text-center text-xs">
            {progress.percentage}% complete
          </div>
        </div>

        {progress.totalBatches > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Batch Progress</span>
              <span className={getStatusColor()}>
                {progress.currentBatch} / {progress.totalBatches} batches
              </span>
            </div>
            <Progress
              value={(progress.currentBatch / progress.totalBatches) * 100}
              className="h-2"
            />
          </div>
        )}

        <div className="text-muted-foreground text-xs">
          {isImporting ? (
            <>
              Processing in batches of 100 participants for optimal performance.
              Please don't close this window.
            </>
          ) : isComplete ? (
            "Import process completed."
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
