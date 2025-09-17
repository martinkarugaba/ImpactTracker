import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function PWDDemographicsSection({ data }: DemographicsProps) {
  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-400">
            Participants with Disabilities
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-purple-50 p-4 dark:bg-purple-950/20">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total PWDs:</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {data.participantsWithDisability}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female PWDs:</span>
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  {data.femalePWDs}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male PWDs:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {data.malePWDs}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
            <h4 className="font-semibold text-amber-700 dark:text-amber-300">
              Types of Disabilities Represented
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.disabilityTypes.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
