"use client";

import { useAtomValue } from "jotai";
import {
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Clock,
  Shield,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isProcessingAtom } from "./atoms";
import { useState, useEffect } from "react";

interface DeletionProgressProps {
  selectedCount: number;
  onCancel?: () => void;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  isComplete?: boolean;
  deletedCount?: number;
  onClose?: () => void;
}

export function DeletionProgress({
  selectedCount,
  onCancel,
  progress,
  isComplete = false,
  deletedCount = 0,
  onClose,
}: DeletionProgressProps) {
  const isProcessing = useAtomValue(isProcessingAtom);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stage, setStage] = useState<"preparing" | "deleting" | "complete">(
    "preparing"
  );

  // Timer for elapsed time
  useEffect(() => {
    if (!isProcessing) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isProcessing]);

  // Update stage based on progress
  useEffect(() => {
    if (isComplete) {
      setStage("complete");
    } else if (isProcessing) {
      if (progress && progress.current > 0) {
        setStage("deleting");
      } else {
        setStage("preparing");
      }
    }
  }, [isProcessing, isComplete, progress]);

  if (!isProcessing && !isComplete) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if (stage === "preparing") {
      return <Shield className="h-6 w-6 animate-pulse text-amber-500" />;
    }
    return <Loader2 className="h-6 w-6 animate-spin text-red-500" />;
  };

  const getStatusText = () => {
    if (isComplete) {
      return `Successfully deleted ${deletedCount} participants`;
    }
    if (stage === "preparing") {
      return "Preparing to delete participants";
    }
    return "Deleting duplicate participants";
  };

  const getStatusDescription = () => {
    if (isComplete) {
      return "All selected duplicates have been permanently removed from the database.";
    }
    if (stage === "preparing") {
      return "Validating selections and preparing for deletion...";
    }
    return "Removing participants from the database. This action cannot be undone.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h3 className="text-lg font-semibold">
                  {isComplete ? "Deletion Complete" : "Deleting Participants"}
                </h3>
                {isProcessing && !isComplete && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatTime(elapsedTime)}
                  </div>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Message */}
          <div className="space-y-2 text-center">
            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getStatusDescription()}
            </p>
          </div>

          {/* Progress Bar */}
          {progress && isProcessing && !isComplete && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {progress.current} / {progress.total}
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
          )}

          {/* Warning Section */}
          {!isComplete && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Permanent Action</p>
                <p>
                  This will permanently delete {selectedCount} participants from
                  the database. This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* Success Section */}
          {isComplete && (
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div className="text-sm text-green-700 dark:text-green-300">
                <p className="font-medium">Deletion Successful</p>
                <p>
                  {deletedCount} duplicate participants have been permanently
                  removed from the database.
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <Users className="h-5 w-5 text-gray-500" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {isComplete ? deletedCount : selectedCount}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {isComplete ? "Deleted" : "Selected"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {stage === "complete" ? "Complete" : "In Progress"}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            {!isComplete && isProcessing && onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={stage === "deleting"}
                className="min-w-[100px]"
              >
                {stage === "deleting" ? "Cannot Cancel" : "Cancel"}
              </Button>
            )}

            {isComplete && onClose && (
              <Button
                onClick={onClose}
                className="min-w-[100px] bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {isProcessing && !isComplete && (
            <div className="flex justify-center pt-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-2 w-2 animate-pulse rounded-full bg-red-400"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
