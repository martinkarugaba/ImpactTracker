"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { Activity } from "../../types/types";
import { useActivityParticipants } from "../../hooks/use-activities";
import { toast } from "sonner";
import {
  demographicsLoadingAtom,
  demographicsDataAtom,
} from "../../atoms/activities-atoms";
import {
  DataAvailabilityNotice,
  DemographicsOverview,
  GenderDemographicsSection,
  PWDDemographicsSection,
  YouthEmploymentSection,
  WageEmploymentSection,
  SelfEmploymentSection,
  SecondaryEmploymentSection,
  generateMockDemographicsData,
} from "./demographics";

interface ParticipantsDemographicsTabProps {
  activity: Activity;
}

export function ParticipantsDemographicsTab({
  activity,
}: ParticipantsDemographicsTabProps) {
  const [demographicsData, setDemographicsData] = useAtom(demographicsDataAtom);
  const [isLoading, setIsLoading] = useAtom(demographicsLoadingAtom);

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
  }, [participantsResponse, setDemographicsData, setIsLoading]);

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
      <DataAvailabilityNotice />

      {/* Basic Demographics Overview */}
      <DemographicsOverview data={demographicsData} />

      {/* Basic Demographics Group */}
      <div className="space-y-6">
        <div className="border-l-4 border-l-blue-500 pl-4">
          <h2 className="mb-1 text-xl font-semibold text-blue-600 dark:text-blue-400">
            Basic Demographics
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Core participant demographics including gender and disability status
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gender Demographics */}
          <GenderDemographicsSection data={demographicsData} />

          {/* PWD Demographics */}
          <PWDDemographicsSection data={demographicsData} />
        </div>
      </div>

      {/* Employment Analytics Group */}
      <div className="space-y-6">
        <div className="border-l-4 border-l-green-500 pl-4">
          <h2 className="mb-1 text-xl font-semibold text-green-600 dark:text-green-400">
            Employment Analytics
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Employment patterns and opportunities across different categories
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Youth Employment */}
          <YouthEmploymentSection data={demographicsData} />

          {/* Wage Employment */}
          <WageEmploymentSection data={demographicsData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Self Employment */}
          <SelfEmploymentSection data={demographicsData} />

          {/* Secondary Employment */}
          <SecondaryEmploymentSection data={demographicsData} />
        </div>
      </div>
    </div>
  );
}
