"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserCheck,
  MapPin,
  Briefcase,
  Building,
  TrendingUp,
  Info,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Activity, ActivityParticipant } from "../../types/types";
import { useActivityParticipants } from "../../hooks/use-activities";
import { toast } from "sonner";

interface ParticipantsDemographicsTabProps {
  activity: Activity;
}

// Demographics interfaces (to be extended when database fields are added)
interface DemographicsData {
  // Basic demographics
  totalParticipants: number;
  trainingType: string;

  // Age & Gender demographics (current available data)
  participantsUrban: number; // To be calculated based on location
  participantsRural: number; // To be calculated based on location
  participants15to35: number;
  participantsAbove35: number;
  maleParticipants: number;
  males15to35: number;
  malesAbove35: number;
  femaleParticipants: number;
  females15to35: number;
  femalesAbove35: number;

  // PWD demographics (current available data)
  participantsWithDisability: number;
  disabilityTypes: string[]; // To be added to database
  femalePWDs: number;
  malePWDs: number;

  // Employment demographics (to be extended)
  youthsInWork: number;
  youthsInWorkUrban: number;
  youthsInWorkRural: number;

  // Wage employment (to be added to database)
  totalWageEmployment: number;
  wageEmploymentMale: number;
  wageEmploymentMale15to35: number;
  wageEmploymentMaleAbove35: number;
  wageEmploymentFemale: number;
  wageEmploymentFemale15to35: number;
  wageEmploymentFemaleAbove35: number;
  wageEmploymentUrban: number;
  wageEmploymentRural: number;
  wageEmploymentPWDs: number;
  wageEmploymentFemalePWDs: number;
  wageEmploymentMalePWDs: number;
  employmentSectors: Array<{
    sector: string;
    total: number;
    newJobs: number;
    sustainedJobs: number;
    improvedJobs: number;
  }>;
  employmentScale: {
    micro: number;
    small: number;
    medium: number;
    large: number;
  };

  // Self-employment (to be added to database)
  totalSelfEmployment: number;
  selfEmploymentMale: number;
  selfEmploymentMale15to35: number;
  selfEmploymentMaleAbove35: number;
  selfEmploymentFemale: number;
  selfEmploymentFemale15to35: number;
  selfEmploymentFemaleAbove35: number;
  selfEmploymentUrban: number;
  selfEmploymentRural: number;
  selfEmploymentPWDs: number;
  selfEmploymentFemalePWDs: number;
  selfEmploymentMalePWDs: number;
  selfEmploymentSectors: Array<{
    sector: string;
    total: number;
    newBusinesses: number;
    sustainedBusinesses: number;
    improvedBusinesses: number;
  }>;
  accessedLoans: number;
  individualSaving: number;
  groupSaving: number;
  businessScale: {
    micro: number;
    small: number;
    medium: number;
    large: number;
  };

  // Secondary employment (to be added to database)
  totalSecondaryEmployment: number;
  secondaryEmploymentMale: number;
  secondaryEmploymentMale15to35: number;
  secondaryEmploymentMaleAbove35: number;
  secondaryEmploymentFemale: number;
  secondaryEmploymentFemale15to35: number;
  secondaryEmploymentFemaleAbove35: number;
  secondaryEmploymentUrban: number;
  secondaryEmploymentRural: number;
  secondaryEmploymentPWDs: number;
  secondaryEmploymentFemalePWDs: number;
  secondaryEmploymentMalePWDs: number;
  secondaryEmploymentSectors: Array<{
    sector: string;
    total: number;
    newJobs: number;
    sustainedJobs: number;
    improvedJobs: number;
  }>;
  secondaryBusinessScale: {
    micro: number;
    small: number;
    medium: number;
    large: number;
  };
}

// Mock data generator for demonstration (to be replaced with real data when database fields are added)
const generateMockDemographicsData = (
  totalParticipants: number,
  _participants: ActivityParticipant[]
): DemographicsData => {
  // Calculate actual demographics from participant data
  // Note: Since demographic fields (sex, age, isPWD) are not available in the current
  // ActivityParticipant type, we'll generate realistic mock data based on total participants

  // Mock gender distribution (approximately 60% female, 40% male - typical for development programs)
  const males = Math.floor(totalParticipants * 0.4);
  const females = totalParticipants - males;

  // Mock age calculations (approximately 70% youth 15-35, 30% above 35)
  const participants15to35 = Math.floor(totalParticipants * 0.7);
  const participantsAbove35 = totalParticipants - participants15to35;

  const males15to35 = Math.floor(males * 0.7);
  const malesAbove35 = males - males15to35;

  const females15to35 = Math.floor(females * 0.7);
  const femalesAbove35 = females - females15to35;

  // Mock PWD calculations (approximately 10% PWD representation)
  const pwdParticipants = Math.floor(totalParticipants * 0.1);
  const malePWDs = Math.floor(pwdParticipants * 0.45); // Slightly fewer male PWDs
  const femalePWDs = pwdParticipants - malePWDs;

  // Location-based calculations (mock - would need location classification)
  const urbanParticipants = Math.floor(totalParticipants * 0.4); // 40% urban estimate
  const ruralParticipants = totalParticipants - urbanParticipants;

  // Mock employment data (to be replaced with real data)
  return {
    totalParticipants,
    trainingType: "Skills Development Training", // Would come from activity type

    participantsUrban: urbanParticipants,
    participantsRural: ruralParticipants,
    participants15to35,
    participantsAbove35,
    maleParticipants: males,
    males15to35,
    malesAbove35,
    femaleParticipants: females,
    females15to35,
    femalesAbove35,

    participantsWithDisability: pwdParticipants,
    disabilityTypes: ["Visual", "Hearing", "Physical", "Mental"], // Mock data
    femalePWDs,
    malePWDs,

    youthsInWork: Math.floor(participants15to35 * 0.6),
    youthsInWorkUrban: Math.floor(participants15to35 * 0.6 * 0.4),
    youthsInWorkRural: Math.floor(participants15to35 * 0.6 * 0.6),

    // Mock wage employment data
    totalWageEmployment: Math.floor(totalParticipants * 0.3),
    wageEmploymentMale: Math.floor(males * 0.35),
    wageEmploymentMale15to35: Math.floor(males15to35 * 0.4),
    wageEmploymentMaleAbove35: Math.floor(malesAbove35 * 0.25),
    wageEmploymentFemale: Math.floor(females * 0.25),
    wageEmploymentFemale15to35: Math.floor(females15to35 * 0.3),
    wageEmploymentFemaleAbove35: Math.floor(femalesAbove35 * 0.2),
    wageEmploymentUrban: Math.floor(urbanParticipants * 0.5),
    wageEmploymentRural: Math.floor(ruralParticipants * 0.2),
    wageEmploymentPWDs: Math.floor(pwdParticipants * 0.15),
    wageEmploymentFemalePWDs: Math.floor(femalePWDs * 0.1),
    wageEmploymentMalePWDs: Math.floor(malePWDs * 0.2),
    employmentSectors: [
      {
        sector: "Petty Trade",
        total: 15,
        newJobs: 8,
        sustainedJobs: 5,
        improvedJobs: 2,
      },
      {
        sector: "Food & Drinks",
        total: 12,
        newJobs: 6,
        sustainedJobs: 4,
        improvedJobs: 2,
      },
      {
        sector: "Manufacturing",
        total: 8,
        newJobs: 3,
        sustainedJobs: 3,
        improvedJobs: 2,
      },
      {
        sector: "Agribusiness",
        total: 20,
        newJobs: 12,
        sustainedJobs: 6,
        improvedJobs: 2,
      },
    ],
    employmentScale: {
      micro: Math.floor(totalParticipants * 0.2),
      small: Math.floor(totalParticipants * 0.15),
      medium: Math.floor(totalParticipants * 0.08),
      large: Math.floor(totalParticipants * 0.02),
    },

    // Mock self-employment data
    totalSelfEmployment: Math.floor(totalParticipants * 0.4),
    selfEmploymentMale: Math.floor(males * 0.45),
    selfEmploymentMale15to35: Math.floor(males15to35 * 0.5),
    selfEmploymentMaleAbove35: Math.floor(malesAbove35 * 0.4),
    selfEmploymentFemale: Math.floor(females * 0.35),
    selfEmploymentFemale15to35: Math.floor(females15to35 * 0.4),
    selfEmploymentFemaleAbove35: Math.floor(femalesAbove35 * 0.3),
    selfEmploymentUrban: Math.floor(urbanParticipants * 0.3),
    selfEmploymentRural: Math.floor(ruralParticipants * 0.5),
    selfEmploymentPWDs: Math.floor(pwdParticipants * 0.25),
    selfEmploymentFemalePWDs: Math.floor(femalePWDs * 0.2),
    selfEmploymentMalePWDs: Math.floor(malePWDs * 0.3),
    selfEmploymentSectors: [
      {
        sector: "Petty Trade",
        total: 25,
        newBusinesses: 15,
        sustainedBusinesses: 8,
        improvedBusinesses: 2,
      },
      {
        sector: "Food & Drinks",
        total: 18,
        newBusinesses: 10,
        sustainedBusinesses: 6,
        improvedBusinesses: 2,
      },
      {
        sector: "Agriculture",
        total: 30,
        newBusinesses: 20,
        sustainedBusinesses: 8,
        improvedBusinesses: 2,
      },
      {
        sector: "Crafts",
        total: 12,
        newBusinesses: 8,
        sustainedBusinesses: 3,
        improvedBusinesses: 1,
      },
    ],
    accessedLoans: Math.floor(totalParticipants * 0.25),
    individualSaving: Math.floor(totalParticipants * 0.6),
    groupSaving: Math.floor(totalParticipants * 0.4),
    businessScale: {
      micro: Math.floor(totalParticipants * 0.3),
      small: Math.floor(totalParticipants * 0.2),
      medium: Math.floor(totalParticipants * 0.1),
      large: Math.floor(totalParticipants * 0.03),
    },

    // Mock secondary employment data
    totalSecondaryEmployment: Math.floor(totalParticipants * 0.15),
    secondaryEmploymentMale: Math.floor(males * 0.18),
    secondaryEmploymentMale15to35: Math.floor(males15to35 * 0.2),
    secondaryEmploymentMaleAbove35: Math.floor(malesAbove35 * 0.15),
    secondaryEmploymentFemale: Math.floor(females * 0.12),
    secondaryEmploymentFemale15to35: Math.floor(females15to35 * 0.15),
    secondaryEmploymentFemaleAbove35: Math.floor(femalesAbove35 * 0.1),
    secondaryEmploymentUrban: Math.floor(urbanParticipants * 0.2),
    secondaryEmploymentRural: Math.floor(ruralParticipants * 0.1),
    secondaryEmploymentPWDs: Math.floor(pwdParticipants * 0.1),
    secondaryEmploymentFemalePWDs: Math.floor(femalePWDs * 0.08),
    secondaryEmploymentMalePWDs: Math.floor(malePWDs * 0.12),
    secondaryEmploymentSectors: [
      {
        sector: "Retail",
        total: 8,
        newJobs: 4,
        sustainedJobs: 3,
        improvedJobs: 1,
      },
      {
        sector: "Services",
        total: 6,
        newJobs: 3,
        sustainedJobs: 2,
        improvedJobs: 1,
      },
      {
        sector: "Transport",
        total: 4,
        newJobs: 2,
        sustainedJobs: 2,
        improvedJobs: 0,
      },
    ],
    secondaryBusinessScale: {
      micro: Math.floor(totalParticipants * 0.1),
      small: Math.floor(totalParticipants * 0.05),
      medium: Math.floor(totalParticipants * 0.02),
      large: Math.floor(totalParticipants * 0.01),
    },
  };
};

export function ParticipantsDemographicsTab({
  activity,
}: ParticipantsDemographicsTabProps) {
  const [demographicsData, setDemographicsData] =
    useState<DemographicsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: participantsResponse } = useActivityParticipants(activity.id);

  useEffect(() => {
    const loadDemographicsData = async () => {
      setIsLoading(true);
      try {
        const participants = participantsResponse?.data || [];
        const totalParticipants = participants.length;

        // Generate demographics data (mix of real and mock data)
        const data = generateMockDemographicsData(
          totalParticipants,
          participants
        );
        setDemographicsData(data);
      } catch (error) {
        console.error("Error loading demographics data:", error);
        toast.error("Failed to load demographics data");
      } finally {
        setIsLoading(false);
      }
    };

    loadDemographicsData();
  }, [participantsResponse]);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-muted-foreground">
          Loading demographics data...
        </div>
      </div>
    );
  }

  if (!demographicsData) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-muted-foreground">
          No demographics data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Data Availability Notice */}
      <Card className="border-muted-foreground/20 bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground mt-0.5 h-5 w-5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Demographics Data Status</p>
              <p className="text-muted-foreground text-sm">
                This tab shows participant demographics with mock data
                calculations. Demographic fields (age, gender, disability
                status, employment details) are not yet available in the current
                participant data structure and will need to be added to the
                database schema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Demographics Overview */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Participants"
          value={demographicsData.totalParticipants}
          footer={{
            title: demographicsData.trainingType,
            description: "Activity participants",
          }}
          icon={<Users className="text-muted-foreground size-4" />}
        />

        <MetricCard
          title="Urban Setting"
          value={demographicsData.participantsUrban}
          footer={{
            title: "Rural Setting",
            description: `${demographicsData.participantsRural} participants`,
          }}
          icon={<MapPin className="text-muted-foreground size-4" />}
        />

        <MetricCard
          title="Youth (15-35)"
          value={demographicsData.participants15to35}
          footer={{
            title: "Above 35 years",
            description: `${demographicsData.participantsAbove35} participants`,
          }}
          icon={<BarChart3 className="text-muted-foreground size-4" />}
        />

        <MetricCard
          title="Persons with Disability"
          value={demographicsData.participantsWithDisability}
          footer={{
            title: `Female: ${demographicsData.femalePWDs} | Male: ${demographicsData.malePWDs}`,
            description: "PWD representation",
          }}
          icon={<UserCheck className="text-muted-foreground size-4" />}
        />
      </div>

      {/* Gender Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gender Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">
                Male Participants ({demographicsData.maleParticipants})
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Male aged 15–35:</span>
                  <span className="font-medium">
                    {demographicsData.males15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male above 35:</span>
                  <span className="font-medium">
                    {demographicsData.malesAbove35}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">
                Female Participants ({demographicsData.femaleParticipants})
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Female aged 15–35:</span>
                  <span className="font-medium">
                    {demographicsData.females15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female above 35:</span>
                  <span className="font-medium">
                    {demographicsData.femalesAbove35}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWD Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Participants with Disabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total PWDs:</span>
                  <span className="font-medium">
                    {demographicsData.participantsWithDisability}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female PWDs:</span>
                  <span className="font-medium">
                    {demographicsData.femalePWDs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male PWDs:</span>
                  <span className="font-medium">
                    {demographicsData.malePWDs}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">
                Types of Disabilities Represented
              </h4>
              <div className="flex flex-wrap gap-2">
                {demographicsData.disabilityTypes.map((type, index) => (
                  <Badge key={index} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Youth Employment */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Youth Employment (15-35 years)
        </h3>
        <div className="*:data-[slot=card]:from-green/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-3">
          <MetricCard
            title="Total Youths in Work"
            value={demographicsData.youthsInWork}
            footer={{
              title: "Employment Success",
              description: "Working youth participants",
            }}
            icon={<TrendingUp className="text-muted-foreground size-4" />}
          />

          <MetricCard
            title="Urban Setting"
            value={demographicsData.youthsInWorkUrban}
            footer={{
              title: "Urban Employment",
              description: "Working youth in cities",
            }}
            icon={<Building className="text-muted-foreground size-4" />}
          />

          <MetricCard
            title="Rural Setting"
            value={demographicsData.youthsInWorkRural}
            footer={{
              title: "Rural Employment",
              description: "Working youth in rural areas",
            }}
            icon={<MapPin className="text-muted-foreground size-4" />}
          />
        </div>
      </div>

      {/* Wage Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Wage Employment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">
                Male Wage Employment
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Male:</span>
                  <span className="font-medium">
                    {demographicsData.wageEmploymentMale}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male (15–35yrs):</span>
                  <span className="font-medium">
                    {demographicsData.wageEmploymentMale15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male above 35yrs:</span>
                  <span className="font-medium">
                    {demographicsData.wageEmploymentMaleAbove35}
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
                  <span className="font-medium">
                    {demographicsData.wageEmploymentFemale}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female (15–35yrs):</span>
                  <span className="font-medium">
                    {demographicsData.wageEmploymentFemale15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female above 35yrs:</span>
                  <span className="font-medium">
                    {demographicsData.wageEmploymentFemaleAbove35}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.wageEmploymentUrban}
              </div>
              <div className="text-muted-foreground text-sm">Urban Setting</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.wageEmploymentRural}
              </div>
              <div className="text-muted-foreground text-sm">Rural Setting</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.wageEmploymentFemalePWDs}
              </div>
              <div className="text-muted-foreground text-sm">Female PWDs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.wageEmploymentMalePWDs}
              </div>
              <div className="text-muted-foreground text-sm">Male PWDs</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Employment Sectors</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {demographicsData.employmentSectors.map((sector, index) => (
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
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Employment Scale</h4>
            <div className="*:data-[slot=card]:from-blue/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
              <MetricCard
                title="Micro Enterprises"
                value={demographicsData.employmentScale.micro}
                footer={{
                  title: "1–2 workers",
                  description: "Small scale employment",
                }}
                icon={<Building className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Small Enterprises"
                value={demographicsData.employmentScale.small}
                footer={{
                  title: "3–10 workers",
                  description: "Growing businesses",
                }}
                icon={<Building className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Medium Enterprises"
                value={demographicsData.employmentScale.medium}
                footer={{
                  title: "11–50 workers",
                  description: "Established companies",
                }}
                icon={<Building className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Large Enterprises"
                value={demographicsData.employmentScale.large}
                footer={{
                  title: "50+ workers",
                  description: "Major employers",
                }}
                icon={<Building className="text-muted-foreground size-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Self Employment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">
                Male Self Employment
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Male:</span>
                  <span className="font-medium">
                    {demographicsData.selfEmploymentMale}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male (15–35yrs):</span>
                  <span className="font-medium">
                    {demographicsData.selfEmploymentMale15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male above 35yrs:</span>
                  <span className="font-medium">
                    {demographicsData.selfEmploymentMaleAbove35}
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
                  <span className="font-medium">
                    {demographicsData.selfEmploymentFemale}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female (15–35yrs):</span>
                  <span className="font-medium">
                    {demographicsData.selfEmploymentFemale15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female above 35yrs:</span>
                  <span className="font-medium">
                    {demographicsData.selfEmploymentFemaleAbove35}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Financial Inclusion & Saving</h4>
            <div className="*:data-[slot=card]:from-purple/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                title="Urban Self-Employment"
                value={demographicsData.selfEmploymentUrban}
                footer={{
                  title: "City-based businesses",
                  description: "Urban entrepreneurs",
                }}
                icon={<Building className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Rural Self-Employment"
                value={demographicsData.selfEmploymentRural}
                footer={{
                  title: "Rural businesses",
                  description: "Rural entrepreneurs",
                }}
                icon={<MapPin className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Accessed Loans"
                value={demographicsData.accessedLoans}
                footer={{
                  title: "Financial Access",
                  description: "Loan beneficiaries",
                }}
                icon={<Briefcase className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Individual Saving"
                value={demographicsData.individualSaving}
                footer={{
                  title: "Personal Savings",
                  description: "Individual savers",
                }}
                icon={<TrendingUp className="text-muted-foreground size-4" />}
              />

              <MetricCard
                title="Group/VSLA Saving"
                value={demographicsData.groupSaving}
                footer={{
                  title: "Collective Savings",
                  description: "Group saving members",
                }}
                icon={<Users className="text-muted-foreground size-4" />}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Self Employment Sectors</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {demographicsData.selfEmploymentSectors.map((sector, index) => (
                <Card key={index} className="p-4">
                  <h5 className="text-sm font-medium">{sector.sector}</h5>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{sector.total}</span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>New:</span>
                      <span className="font-medium">
                        {sector.newBusinesses}
                      </span>
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

      {/* Secondary Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Secondary Employment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">
                Male Secondary Employment
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Male:</span>
                  <span className="font-medium">
                    {demographicsData.secondaryEmploymentMale}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male (15–35yrs):</span>
                  <span className="font-medium">
                    {demographicsData.secondaryEmploymentMale15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Male above 35yrs:</span>
                  <span className="font-medium">
                    {demographicsData.secondaryEmploymentMaleAbove35}
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
                    {demographicsData.secondaryEmploymentFemale}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female (15–35yrs):</span>
                  <span className="font-medium">
                    {demographicsData.secondaryEmploymentFemale15to35}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female above 35yrs:</span>
                  <span className="font-medium">
                    {demographicsData.secondaryEmploymentFemaleAbove35}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.secondaryEmploymentUrban}
              </div>
              <div className="text-muted-foreground text-sm">Urban Setting</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.secondaryEmploymentRural}
              </div>
              <div className="text-muted-foreground text-sm">Rural Setting</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.secondaryEmploymentFemalePWDs}
              </div>
              <div className="text-muted-foreground text-sm">Female PWDs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {demographicsData.secondaryEmploymentMalePWDs}
              </div>
              <div className="text-muted-foreground text-sm">Male PWDs</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Secondary Employment Sectors</h4>
            <div className="grid gap-4 md:grid-cols-3">
              {demographicsData.secondaryEmploymentSectors.map(
                (sector, index) => (
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
                        <span className="font-medium">
                          {sector.sustainedJobs}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex justify-between">
                        <span>Improved:</span>
                        <span className="font-medium">
                          {sector.improvedJobs}
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
