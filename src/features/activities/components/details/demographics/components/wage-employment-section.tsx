import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/ui/metric-card";
import { Briefcase, Building } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function WageEmploymentSection({ data }: DemographicsProps) {
  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="text-orange-600 dark:text-orange-400">
            Wage Employment
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">
              Male Wage Employment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Male:</span>
                <span className="font-medium">{data.wageEmploymentMale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male (15–35yrs):</span>
                <span className="font-medium">
                  {data.wageEmploymentMale15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male above 35yrs:</span>
                <span className="font-medium">
                  {data.wageEmploymentMaleAbove35}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">
              Female Wage Employment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Female:</span>
                <span className="font-medium">{data.wageEmploymentFemale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female (15–35yrs):</span>
                <span className="font-medium">
                  {data.wageEmploymentFemale15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female above 35yrs:</span>
                <span className="font-medium">
                  {data.wageEmploymentFemaleAbove35}
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
            style={{ backgroundColor: "oklch(var(--chart-1) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-1))" }}
            >
              {data.wageEmploymentUrban}
            </div>
            <div className="text-muted-foreground text-sm">Urban Setting</div>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "oklch(var(--chart-2) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-2))" }}
            >
              {data.wageEmploymentRural}
            </div>
            <div className="text-muted-foreground text-sm">Rural Setting</div>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "oklch(var(--chart-3) / 0.1)" }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "oklch(var(--chart-3))" }}
            >
              {data.wageEmploymentFemalePWDs}
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
              {data.wageEmploymentMalePWDs}
            </div>
            <div className="text-muted-foreground text-sm">Male PWDs</div>
          </div>
        </div>

        <Separator />

        {/* Employment Sectors */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "oklch(var(--chart-4))" }}
            ></div>
            <span style={{ color: "oklch(var(--chart-4))" }}>
              Employment Sectors
            </span>
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.employmentSectors.map((sector, index) => {
              const colors = [
                "oklch(var(--chart-1))",
                "oklch(var(--chart-2))",
                "oklch(var(--chart-3))",
                "oklch(var(--chart-4))",
              ];
              const sectorColor = colors[index % colors.length];
              return (
                <Card
                  key={index}
                  className="border-l-2 p-4"
                  style={{ borderLeftColor: sectorColor }}
                >
                  <h5 className="flex items-center gap-2 text-sm font-medium">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: sectorColor }}
                    ></div>
                    {sector.sector}
                  </h5>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span
                        className="font-medium"
                        style={{ color: sectorColor }}
                      >
                        {sector.total}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>New:</span>
                      <span className="font-medium">{sector.newJobs}</span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>Sustained:</span>
                      <span className="font-medium">
                        {sector.sustainedJobs}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>Improved:</span>
                      <span className="font-medium">{sector.improvedJobs}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Employment Scale */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "oklch(var(--chart-5))" }}
            ></div>
            <span style={{ color: "oklch(var(--chart-5))" }}>
              Employment Scale
            </span>
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard
              title="Micro Enterprises"
              value={data.employmentScale.micro}
              footer={{
                title: "1–2 workers",
                description: "Small scale employment",
              }}
              icon={
                <Building
                  className="size-4"
                  style={{ color: "oklch(var(--chart-1))" }}
                />
              }
            />

            <MetricCard
              title="Small Enterprises"
              value={data.employmentScale.small}
              footer={{
                title: "3–10 workers",
                description: "Growing businesses",
              }}
              icon={
                <Building
                  className="size-4"
                  style={{ color: "oklch(var(--chart-2))" }}
                />
              }
            />

            <MetricCard
              title="Medium Enterprises"
              value={data.employmentScale.medium}
              footer={{
                title: "11–50 workers",
                description: "Established companies",
              }}
              icon={
                <Building
                  className="size-4"
                  style={{ color: "oklch(var(--chart-3))" }}
                />
              }
            />

            <MetricCard
              title="Large Enterprises"
              value={data.employmentScale.large}
              footer={{
                title: "50+ workers",
                description: "Major employers",
              }}
              icon={
                <Building
                  className="size-4"
                  style={{ color: "oklch(var(--chart-4))" }}
                />
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
