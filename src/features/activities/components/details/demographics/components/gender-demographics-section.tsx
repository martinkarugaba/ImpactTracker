import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function GenderDemographicsSection({ data }: DemographicsProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-600 dark:text-blue-400">
            Gender Demographics
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
            <h4 className="text-foreground flex items-center gap-2 font-semibold">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-green-700 dark:text-green-300">
                Male Participants ({data.maleParticipants})
              </span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Male aged 15–35:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {data.males15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male above 35:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {data.malesAbove35}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg bg-pink-50 p-4 dark:bg-pink-950/20">
            <h4 className="text-foreground flex items-center gap-2 font-semibold">
              <div className="h-2 w-2 rounded-full bg-pink-500"></div>
              <span className="text-pink-700 dark:text-pink-300">
                Female Participants ({data.femaleParticipants})
              </span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Female aged 15–35:</span>
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  {data.females15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female above 35:</span>
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  {data.femalesAbove35}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
