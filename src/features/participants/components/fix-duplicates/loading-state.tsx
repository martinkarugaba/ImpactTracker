"use client";

import { useAtomValue } from "jotai";
import { Search, Users, AlertTriangle, Loader2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { isLoadingDuplicatesAtom } from "./atoms";
import { useEffect, useState } from "react";

export function LoadingState() {
  const isLoading = useAtomValue(isLoadingDuplicatesAtom);
  const [dots, setDots] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animated dots effect
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Timer for elapsed time
  useEffect(() => {
    if (!isLoading) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="flex min-h-[500px] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-6 text-center">
            {/* Animated Icon Stack */}
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30" />
              <div
                className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-800/30 dark:to-indigo-800/30"
                style={{ animationDelay: "0.5s" }}
              />
              <div className="absolute inset-4 rounded-full bg-white shadow-inner dark:bg-gray-800" />
              <Search className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform text-blue-600 dark:text-blue-400" />
              <Loader2 className="absolute top-2 right-2 h-5 w-5 animate-spin text-blue-500" />
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-400" />
            </div>

            {/* Title with animated dots */}
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Analyzing Participants{dots}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scanning for duplicate entries across your database
              </p>
            </div>

            {/* Timer */}
            {elapsedTime > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Zap className="h-4 w-4" />
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <Users className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="text-left text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Smart Duplicate Detection</p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Comparing names, contacts, and locations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="text-left text-xs text-amber-700 dark:text-amber-300">
                  <p className="font-medium">Processing in Background</p>
                  <p className="text-amber-600 dark:text-amber-400">
                    Large datasets may take a few minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Loading Tips */}
            <div className="space-y-1 border-t pt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>• Analyzing participant records for similarities</p>
              <p>• Checking name variations and contact matches</p>
              <p>• This helps maintain data quality</p>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-2 w-2 animate-pulse rounded-full bg-blue-400"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
