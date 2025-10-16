"use client";

import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { CompactMetricCard } from "@/components/ui/compact-metric-card";
import {
  GraduationCap,
  Building2,
  Users2,
  Briefcase,
  TrendingUp,
  Heart,
  BookOpen,
  Settings,
  Target,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NewParticipantAnalyticsProps {
  participants: Participant[];
  isLoading: boolean;
}

export function NewParticipantAnalytics({
  participants,
  isLoading,
}: NewParticipantAnalyticsProps) {
  const metrics = useParticipantMetrics(participants);
  const { formatPercent } = metrics;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        {/* Education Analytics */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Education Level Distribution
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {metrics.educationStats.map(({ level, count, percent }) => (
              <CompactMetricCard
                key={level}
                title={level.charAt(0).toUpperCase() + level.slice(1)}
                count={count}
                percent={formatPercent(percent)}
                isLoading={isLoading}
                icon={<GraduationCap size={16} />}
                iconColor="text-blue-500"
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* VSLA & Financial Inclusion */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            VSLA Participation & Financial Inclusion
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CompactMetricCard
              title="VSLA Members"
              count={metrics.vslaSubscribed.length}
              percent={formatPercent(metrics.vslaSubscribedPercent)}
              isLoading={isLoading}
              icon={<Users2 size={16} />}
              iconColor="text-green-500"
            />

            <CompactMetricCard
              title="Teen Mothers"
              count={metrics.teenMothers.length}
              percent={formatPercent(metrics.teenMotherPercent)}
              isLoading={isLoading}
              icon={<Heart size={16} />}
              iconColor="text-pink-500"
            />

            <CompactMetricCard
              title="Non-VSLA Members"
              count={metrics.vslaNotSubscribed.length}
              percent={formatPercent(100 - metrics.vslaSubscribedPercent)}
              isLoading={isLoading}
              icon={<Users2 size={16} />}
              iconColor="text-gray-500"
            />
          </div>
        </div>

        <Separator />

        {/* Enterprise & Employment */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Enterprise Ownership & Employment
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CompactMetricCard
              title="Enterprise Owners"
              count={metrics.enterpriseOwners.length}
              percent={formatPercent(metrics.enterpriseOwnershipPercent)}
              isLoading={isLoading}
              icon={<Building2 size={16} />}
              iconColor="text-purple-500"
            />

            <CompactMetricCard
              title="Non-Enterprise Owners"
              count={metrics.nonEnterpriseOwners.length}
              percent={formatPercent(100 - metrics.enterpriseOwnershipPercent)}
              isLoading={isLoading}
              icon={<Briefcase size={16} />}
              iconColor="text-gray-500"
            />
          </div>
        </div>

        <Separator />

        {/* Skills Development */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Skills Development & Training
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CompactMetricCard
              title="Vocational Skills"
              count={metrics.withVocationalSkills.length}
              percent={formatPercent(metrics.vocationalSkillsPercent)}
              isLoading={isLoading}
              icon={<Settings size={16} />}
              iconColor="text-orange-500"
            />

            <CompactMetricCard
              title="Soft Skills"
              count={metrics.withSoftSkills.length}
              percent={formatPercent(metrics.softSkillsPercent)}
              isLoading={isLoading}
              icon={<BookOpen size={16} />}
              iconColor="text-teal-500"
            />

            <CompactMetricCard
              title="Business Skills"
              count={metrics.withBusinessSkills.length}
              percent={formatPercent(metrics.businessSkillsPercent)}
              isLoading={isLoading}
              icon={<TrendingUp size={16} />}
              iconColor="text-indigo-500"
            />
          </div>
        </div>

        <Separator />

        {/* Marital Status Distribution */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Marital Status Distribution
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.maritalStats.map(({ status, count, percent }) => (
              <CompactMetricCard
                key={status}
                title={status.charAt(0).toUpperCase() + status.slice(1)}
                count={count}
                percent={formatPercent(percent)}
                isLoading={isLoading}
                icon={<Target size={16} />}
                iconColor="text-slate-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
