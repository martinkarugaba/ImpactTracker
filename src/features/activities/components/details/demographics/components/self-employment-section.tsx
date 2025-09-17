import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/ui/metric-card";
import { Building, MapPin, Briefcase, TrendingUp, Users } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function SelfEmploymentSection({ data }: DemographicsProps) {
  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <span className="text-teal-600 dark:text-teal-400">
            Self Employment
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">
              Male Self Employment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Male:</span>
                <span className="font-medium">{data.selfEmploymentMale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male (15–35yrs):</span>
                <span className="font-medium">
                  {data.selfEmploymentMale15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Male above 35yrs:</span>
                <span className="font-medium">
                  {data.selfEmploymentMaleAbove35}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">
              Female Self Employment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Female:</span>
                <span className="font-medium">{data.selfEmploymentFemale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female (15–35yrs):</span>
                <span className="font-medium">
                  {data.selfEmploymentFemale15to35}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female above 35yrs:</span>
                <span className="font-medium">
                  {data.selfEmploymentFemaleAbove35}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Financial Inclusion & Saving */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "oklch(var(--chart-3))" }}
            ></div>
            <span style={{ color: "oklch(var(--chart-3))" }}>
              Financial Inclusion & Saving
            </span>
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Urban Self-Employment"
              value={data.selfEmploymentUrban}
              footer={{
                title: "City-based businesses",
                description: "Urban entrepreneurs",
              }}
              icon={
                <Building
                  className="size-4"
                  style={{ color: "oklch(var(--chart-1))" }}
                />
              }
            />

            <MetricCard
              title="Rural Self-Employment"
              value={data.selfEmploymentRural}
              footer={{
                title: "Rural businesses",
                description: "Rural entrepreneurs",
              }}
              icon={
                <MapPin
                  className="size-4"
                  style={{ color: "oklch(var(--chart-2))" }}
                />
              }
            />

            <MetricCard
              title="Accessed Loans"
              value={data.accessedLoans}
              footer={{
                title: "Financial Access",
                description: "Loan beneficiaries",
              }}
              icon={
                <Briefcase
                  className="size-4"
                  style={{ color: "oklch(var(--chart-3))" }}
                />
              }
            />

            <MetricCard
              title="Individual Saving"
              value={data.individualSaving}
              footer={{
                title: "Personal Savings",
                description: "Individual savers",
              }}
              icon={
                <TrendingUp
                  className="size-4"
                  style={{ color: "oklch(var(--chart-4))" }}
                />
              }
            />

            <MetricCard
              title="Group/VSLA Saving"
              value={data.groupSaving}
              footer={{
                title: "Collective Savings",
                description: "Group saving members",
              }}
              icon={
                <Users
                  className="size-4"
                  style={{ color: "oklch(var(--chart-5))" }}
                />
              }
            />
          </div>
        </div>

        <Separator />

        {/* Self Employment Sectors */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "oklch(var(--chart-5))" }}
            ></div>
            <span style={{ color: "oklch(var(--chart-5))" }}>
              Self Employment Sectors
            </span>
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.selfEmploymentSectors.map((sector, index) => (
              <Card key={index} className="p-4">
                <h5 className="text-sm font-medium">{sector.sector}</h5>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{sector.total}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>New:</span>
                    <span className="font-medium">{sector.newBusinesses}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>Sustained:</span>
                    <span className="font-medium">
                      {sector.sustainedBusinesses}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>Improved:</span>
                    <span className="font-medium">
                      {sector.improvedBusinesses}
                    </span>
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
