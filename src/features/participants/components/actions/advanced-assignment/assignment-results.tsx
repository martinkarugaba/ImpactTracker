import { CheckCircle2 } from "lucide-react";
import type { AssignmentResult } from "./types";

interface AssignmentResultsProps {
  assignmentData?: AssignmentResult;
  isSuccess: boolean;
  isError: boolean;
  error?: Error | null;
}

export function AssignmentResults({
  assignmentData,
  isSuccess,
  isError,
  error,
}: AssignmentResultsProps) {
  if (isSuccess && assignmentData) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="mb-2 flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">Assignment Completed</span>
        </div>
        <p className="mb-2 text-sm text-green-700 dark:text-green-300">
          {assignmentData.message}
        </p>

        {assignmentData.details && (
          <div className="text-sm text-green-600 dark:text-green-400">
            <p>
              <strong>Summary:</strong> Updated{" "}
              {assignmentData.details.totalParticipantsUpdated || 0} out of{" "}
              {assignmentData.details.totalParticipantsFound || 0} participants
              across {assignmentData.details.totalSubCounties || 0} subcounties
            </p>

            {assignmentData.details.results && (
              <div className="mt-2 space-y-1">
                <p className="font-medium">Breakdown by subcounty:</p>
                {assignmentData.details.results.map((result, index) => (
                  <div key={index} className="ml-2 text-xs">
                    • {result.subcounty || result.parish}:{" "}
                    {result.participantsUpdated} of {result.participantsFound}{" "}
                    participants
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h4 className="mb-2 font-medium text-red-800 dark:text-red-200">
          Assignment Failed
        </h4>
        <p className="text-sm text-red-700 dark:text-red-300">
          {error?.message || "An error occurred during assignment"}
        </p>
      </div>
    );
  }

  return null;
}
