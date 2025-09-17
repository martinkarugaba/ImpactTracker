"use client";

import { useState, useMemo } from "react";
import {
  Users,
  BarChart3,
  UserCheck,
  Heart,
  GraduationCap,
  Briefcase,
  Building2,
  Banknote,
  TrendingUp,
  UserX,
  Award,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type Participant } from "../../types/types";

// Utility function to format values with smaller percentage text
function formatValueWithPercentage(
  value: number,
  percentage: number
): React.ReactNode {
  return (
    <span className="flex items-baseline gap-1">
      <span>{value.toLocaleString()}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        ({percentage}%)
      </span>
    </span>
  );
}

// Utility function to format percentage-only values
function formatPercentageValue(percentage: number): React.ReactNode {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-lg">{percentage}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
    </span>
  );
}

// Helper function to calculate age from date of birth or use existing age
function calculateAge(participant: Participant): number | null {
  if (participant.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(participant.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  }

  return participant.age || null;
}

// Function to calculate simplified key metrics
function calculateKeyMetrics(participants: Participant[]) {
  const total = participants.length;

  // Basic demographics
  const male = participants.filter(p => p.sex === "male").length;
  const female = participants.filter(p => p.sex === "female").length;
  const youth = participants.filter(p => {
    const age = calculateAge(p);
    return age !== null && age >= 15 && age <= 35;
  }).length;
  const pwds = participants.filter(p => p.isPWD === "yes").length;

  // Employment & Skills
  const employed = participants.filter(
    p => p.employmentStatus !== "unemployed" && p.employmentStatus !== null
  ).length;
  const hasVocationalSkills = participants.filter(
    p => p.hasVocationalSkills === "yes"
  ).length;
  const hasBusinessSkills = participants.filter(
    p => p.hasBusinessSkills === "yes"
  ).length;

  // Financial Inclusion
  const vslaMembers = participants.filter(
    p => p.isSubscribedToVSLA === "yes"
  ).length;
  const enterpriseOwners = participants.filter(
    p => p.ownsEnterprise === "yes"
  ).length;

  return {
    total,
    demographics: {
      male,
      female,
      youth,
      youthPercentage: total > 0 ? Math.round((youth / total) * 100) : 0,
      femalePercentage: total > 0 ? Math.round((female / total) * 100) : 0,
      pwds,
      pwdPercentage: total > 0 ? Math.round((pwds / total) * 100) : 0,
    },
    employment: {
      employed,
      employmentRate: total > 0 ? Math.round((employed / total) * 100) : 0,
      unemployed: total - employed,
    },
    skills: {
      hasVocationalSkills,
      hasBusinessSkills,
      vocationalRate:
        total > 0 ? Math.round((hasVocationalSkills / total) * 100) : 0,
      businessRate:
        total > 0 ? Math.round((hasBusinessSkills / total) * 100) : 0,
    },
    financial: {
      vslaMembers,
      enterpriseOwners,
      vslaRate: total > 0 ? Math.round((vslaMembers / total) * 100) : 0,
      enterpriseRate:
        total > 0 ? Math.round((enterpriseOwners / total) * 100) : 0,
    },
  };
}

// Section component for collapsible detailed metrics
interface MetricSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

function MetricSection({
  title,
  description,
  icon,
  gradient,
  isOpen,
  onToggle,
  children,
  badge,
}: MetricSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="overflow-hidden transition-all duration-200">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl bg-gradient-to-r ${gradient} p-3 shadow-lg`}
                >
                  {icon}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {title}
                    {badge && (
                      <Badge variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <>
                      <EyeOff className="mr-1 h-4 w-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </>
                  )}
                </Button>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface SimplifiedParticipantAnalyticsProps {
  participants: Participant[];
  isLoading?: boolean;
}

export function SimplifiedParticipantAnalytics({
  participants,
  isLoading = false,
}: SimplifiedParticipantAnalyticsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    demographics: false,
    employment: false,
    skills: false,
    financial: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const metrics = useMemo(
    () => calculateKeyMetrics(participants),
    [participants]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Overview - Always Visible */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-3 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
              Analytics Overview
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Key insights from {metrics.total} participants
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Participants"
            value={metrics.total.toLocaleString()}
            footer={{
              title: "Registered",
              description: "All active participants",
            }}
            icon={<Users className="size-4" />}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
          />

          <MetricCard
            title="Youth (15-35)"
            value={formatValueWithPercentage(
              metrics.demographics.youth,
              metrics.demographics.youthPercentage
            )}
            footer={{
              title: "Target demographic",
              description: "Young participants",
            }}
            icon={<UserCheck className="size-4" />}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
          />

          <MetricCard
            title="Female Participation"
            value={formatValueWithPercentage(
              metrics.demographics.female,
              metrics.demographics.femalePercentage
            )}
            footer={{
              title: "Gender inclusion",
              description: "Female participants",
            }}
            icon={<Heart className="size-4" />}
            className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50"
          />

          <MetricCard
            title="Employment Rate"
            value={formatPercentageValue(metrics.employment.employmentRate)}
            footer={{
              title: "Economic impact",
              description: `${metrics.employment.employed} employed`,
            }}
            icon={<Briefcase className="size-4" />}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50"
          />
        </div>
      </div>

      {/* Detailed Sections - Collapsible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Detailed Analytics
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allOpen = Object.values(openSections).every(Boolean);
                const newState = allOpen ? false : true;
                setOpenSections({
                  demographics: newState,
                  employment: newState,
                  skills: newState,
                  financial: newState,
                });
              }}
            >
              {Object.values(openSections).every(Boolean) ? (
                <>
                  <EyeOff className="mr-1 h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-4 w-4" />
                  Expand All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Demographics Section */}
        <MetricSection
          title="Demographics"
          description="Age, gender, and population segments"
          icon={<Users className="h-6 w-6 text-white" />}
          gradient="from-blue-500 to-cyan-500"
          isOpen={openSections.demographics}
          onToggle={() => toggleSection("demographics")}
          badge={`${metrics.demographics.pwds} PWDs`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Male Participants"
              value={metrics.demographics.male}
              footer={{
                title: "Gender distribution",
                description: `${100 - metrics.demographics.femalePercentage}% of total`,
              }}
              icon={<UserCheck className="size-4" />}
            />
            <MetricCard
              title="Female Participants"
              value={metrics.demographics.female}
              footer={{
                title: "Gender distribution",
                description: `${metrics.demographics.femalePercentage}% of total`,
              }}
              icon={<Heart className="size-4" />}
            />
            <MetricCard
              title="Persons with Disabilities"
              value={formatValueWithPercentage(
                metrics.demographics.pwds,
                metrics.demographics.pwdPercentage
              )}
              footer={{
                title: "Inclusion metrics",
                description: "Special needs support",
              }}
              icon={<UserX className="size-4" />}
            />
          </div>
        </MetricSection>

        {/* Employment Section */}
        <MetricSection
          title="Employment & Income"
          description="Employment status and income sources"
          icon={<Briefcase className="h-6 w-6 text-white" />}
          gradient="from-green-500 to-emerald-500"
          isOpen={openSections.employment}
          onToggle={() => toggleSection("employment")}
          badge={
            <span className="flex items-baseline gap-1">
              <span>{metrics.employment.employmentRate}</span>
              <span className="text-xs">% employed</span>
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Employed"
              value={metrics.employment.employed}
              footer={{
                title: "Economic participation",
                description: `${metrics.employment.employmentRate}% employment rate`,
              }}
              icon={<Briefcase className="size-4" />}
            />
            <MetricCard
              title="Unemployed"
              value={metrics.employment.unemployed}
              footer={{
                title: "Need support",
                description: `${100 - metrics.employment.employmentRate}% of total`,
              }}
              icon={<UserX className="size-4" />}
            />
            <MetricCard
              title="Enterprise Owners"
              value={formatValueWithPercentage(
                metrics.financial.enterpriseOwners,
                metrics.financial.enterpriseRate
              )}
              footer={{
                title: "Entrepreneurship",
                description: "Business ownership",
              }}
              icon={<Building2 className="size-4" />}
            />
          </div>
        </MetricSection>

        {/* Skills Section */}
        <MetricSection
          title="Skills & Training"
          description="Vocational and business skills development"
          icon={<GraduationCap className="h-6 w-6 text-white" />}
          gradient="from-purple-500 to-indigo-500"
          isOpen={openSections.skills}
          onToggle={() => toggleSection("skills")}
          badge={
            <span className="flex items-baseline gap-1">
              <span>{metrics.skills.vocationalRate}</span>
              <span className="text-xs">% trained</span>
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Vocational Skills"
              value={formatValueWithPercentage(
                metrics.skills.hasVocationalSkills,
                metrics.skills.vocationalRate
              )}
              footer={{
                title: "Technical training",
                description: "Job-ready skills",
              }}
              icon={<Award className="size-4" />}
            />
            <MetricCard
              title="Business Skills"
              value={formatValueWithPercentage(
                metrics.skills.hasBusinessSkills,
                metrics.skills.businessRate
              )}
              footer={{
                title: "Entrepreneurship",
                description: "Business management",
              }}
              icon={<TrendingUp className="size-4" />}
            />
            <MetricCard
              title="Skills Coverage"
              value={formatPercentageValue(
                Math.max(
                  metrics.skills.vocationalRate,
                  metrics.skills.businessRate
                )
              )}
              footer={{
                title: "Training reach",
                description: "Participants with skills",
              }}
              icon={<BarChart3 className="size-4" />}
            />
          </div>
        </MetricSection>

        {/* Financial Inclusion Section */}
        <MetricSection
          title="Financial Inclusion"
          description="Access to financial services and savings"
          icon={<Banknote className="h-6 w-6 text-white" />}
          gradient="from-emerald-500 to-green-500"
          isOpen={openSections.financial}
          onToggle={() => toggleSection("financial")}
          badge={
            <span className="flex items-baseline gap-1">
              <span>{metrics.financial.vslaRate}</span>
              <span className="text-xs">% VSLA members</span>
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="VSLA Members"
              value={formatValueWithPercentage(
                metrics.financial.vslaMembers,
                metrics.financial.vslaRate
              )}
              footer={{
                title: "Savings groups",
                description: "Community finance",
              }}
              icon={<Users className="size-4" />}
            />
            <MetricCard
              title="Enterprise Owners"
              value={`${metrics.financial.enterpriseOwners} (${metrics.financial.enterpriseRate}%)`}
              footer={{
                title: "Business ownership",
                description: "Economic empowerment",
              }}
              icon={<Building2 className="size-4" />}
            />
            <MetricCard
              title="Financial Inclusion Rate"
              value={formatPercentageValue(
                Math.max(
                  metrics.financial.vslaRate,
                  metrics.financial.enterpriseRate
                )
              )}
              footer={{
                title: "Access to finance",
                description: "Economic participation",
              }}
              icon={<TrendingUp className="size-4" />}
            />
          </div>
        </MetricSection>
      </div>
    </div>
  );
}
