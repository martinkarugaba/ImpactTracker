"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
} from "lucide-react";
import {
  formatShortDate,
  formatCurrency,
  calculateDurationInDays,
} from "../../utils/format-utils";

interface KeyInformationCardsProps {
  startDate: string;
  endDate?: string | null;
  budget?: number | null;
  numberOfParticipants?: number | null;
}

export function KeyInformationCards({
  startDate,
  endDate,
  budget,
  numberOfParticipants,
}: KeyInformationCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center p-6">
          <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Start Date
            </p>
            <p className="text-2xl font-bold">{formatShortDate(startDate)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <ClockIcon className="mr-3 h-8 w-8 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Duration
            </p>
            <p className="text-2xl font-bold">
              {endDate
                ? `${calculateDurationInDays(startDate, endDate)} days`
                : "Ongoing"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <DollarSignIcon className="mr-3 h-8 w-8 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Budget
            </p>
            <p className="text-2xl font-bold">
              {budget ? formatCurrency(budget) : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <UsersIcon className="mr-3 h-8 w-8 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Participants
            </p>
            <p className="text-2xl font-bold">{numberOfParticipants || 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
