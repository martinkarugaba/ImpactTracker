"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle } from "lucide-react";

interface DuplicateDetectionProgressProps {
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  isDetecting: boolean;
  isComplete?: boolean;
}

export function DuplicateDetectionProgress({
  progress,
  isDetecting,
  isComplete = false,
}: DuplicateDetectionProgressProps) {
  if (!isDetecting && !isComplete) {
    return null;
  }

  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Search className="h-5 w-5 text-blue-500" />;
  };

  const getStatusText = () => {
    if (isComplete) {
      return "Duplicate detection completed";
    }
    return "Checking for duplicates...";
  };

  const getStatusColor = () => {
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
            <span>Progress</span>
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

        <div className="text-muted-foreground text-xs">
          {isDetecting ? (
            <>
              Analyzing records in batches to identify potential duplicates.
              This helps prevent importing duplicate participants.
            </>
          ) : isComplete ? (
            "Duplicate analysis completed successfully."
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
