import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PieChart } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function SecondaryEmploymentSection({ data }: DemographicsProps) {
  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-indigo-600 dark:text-indigo-400">
            Secondary Employment
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">
              Male Secondary Employment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Male:</span>
                <span className="font-medium">
                  {data.secondaryEmploymentMale}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male (15–35yrs):</span>
                <span className="font-medium">
                  {data.secondaryEmploymentMale15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male above 35yrs:</span>
                <span className="font-medium">
                  {data.secondaryEmploymentMaleAbove35}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">
              Female Secondary Employment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Female:</span>
                <span className="font-medium">
                  {data.secondaryEmploymentFemale}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female (15–35yrs):</span>
                <span className="font-medium">
                  {data.secondaryEmploymentFemale15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female above 35yrs:</span>
                <span className="font-medium">
                  {data.secondaryEmploymentFemaleAbove35}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Location and PWD Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "oklch(var(--chart-2) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-2))" }}
            >
              {data.secondaryEmploymentUrban}
            </div>
            <div className="text-muted-foreground text-sm">Urban Setting</div>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "oklch(var(--chart-3) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-3))" }}
            >
              {data.secondaryEmploymentRural}
            </div>
            <div className="text-muted-foreground text-sm">Rural Setting</div>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "oklch(var(--chart-1) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-1))" }}
            >
              {data.secondaryEmploymentFemalePWDs}
            </div>
            <div className="text-muted-foreground text-sm">Female PWDs</div>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "oklch(var(--chart-4) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-4))" }}
            >
              {data.secondaryEmploymentMalePWDs}
            </div>
            <div className="text-muted-foreground text-sm">Male PWDs</div>
          </div>
        </div>

        <Separator />

        {/* Secondary Employment Sectors */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "oklch(var(--chart-2))" }}
            ></div>
            <span style={{ color: "oklch(var(--chart-2))" }}>
              Secondary Employment Sectors
            </span>
          </h4>
          <div className="grid gap-4 md:grid-cols-3">
            {data.secondaryEmploymentSectors.map((sector, index) => (
              <Card key={index} className="p-4">
                <h5 className="text-sm font-medium">{sector.sector}</h5>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{sector.total}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>New:</span>
                    <span className="font-medium">{sector.newJobs}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>Sustained:</span>
                    <span className="font-medium">{sector.sustainedJobs}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>Improved:</span>
                    <span className="font-medium">{sector.improvedJobs}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
