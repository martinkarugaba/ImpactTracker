"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  CheckCircle,
  Users,
  Clock,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(
    null
  );

  // Timer for elapsed time
  useEffect(() => {
    if (!isDetecting) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isDetecting]);

  // Calculate estimated time remaining
  useEffect(() => {
    if (progress.percentage > 10 && elapsedTime > 0) {
      const rate = progress.percentage / elapsedTime;
      const remaining = (100 - progress.percentage) / rate;
      setEstimatedTimeLeft(Math.ceil(remaining));
    }
  }, [progress.percentage, elapsedTime]);

  if (!isDetecting && !isComplete) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return (
      <div className="relative">
        <Search className="h-5 w-5 text-blue-500" />
        <Loader2 className="absolute -top-1 -right-1 h-3 w-3 animate-spin text-blue-400" />
      </div>
    );
  };

  const getStatusText = () => {
    if (isComplete) {
      return "Duplicate analysis completed";
    }
    return "Analyzing participants for duplicates";
  };

  const getStatusColor = () => {
    if (isComplete) return "text-green-700 dark:text-green-400";
    return "text-blue-700 dark:text-blue-400";
  };

  return (
    <Card className="w-full border border-gray-200 shadow-sm dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            {getStatusIcon()}
            {getStatusText()}
          </div>
          {isDetecting && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              {formatTime(elapsedTime)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {progress.current.toLocaleString()} /{" "}
              {progress.total.toLocaleString()} participants
            </span>
          </div>
          <div className="relative">
            <Progress value={progress.percentage} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow">
                {progress.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
            <Users className="h-4 w-4 text-blue-500" />
            <div className="text-xs">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {progress.current.toLocaleString()}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Processed</p>
            </div>
          </div>

          {estimatedTimeLeft && isDetecting && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
              <Zap className="h-4 w-4 text-amber-500" />
              <div className="text-xs">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  ~{formatTime(estimatedTimeLeft)}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Remaining</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {isDetecting ? (
              <div className="space-y-1">
                <p className="font-medium">
                  Advanced duplicate detection in progress
                </p>
                <p>
                  Comparing participant names, contacts, and locations across
                  batches to identify potential duplicates before import.
                </p>
              </div>
            ) : isComplete ? (
              <p className="font-medium">
                Analysis completed successfully. Review any duplicates found
                before proceeding.
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
