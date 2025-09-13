"use client";

import { useState, useEffect } from "react";
import { Activity } from "../../types/types";
import { useActivityParticipants } from "../../hooks/use-activities";
import { toast } from "sonner";
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
  type DemographicsData,
} from "./demographics";

interface ParticipantsDemographicsTabProps {
  activity: Activity;
}

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
      <DataAvailabilityNotice />

      {/* Basic Demographics Overview */}
      <DemographicsOverview data={demographicsData} />

      {/* Gender Demographics */}
      <GenderDemographicsSection data={demographicsData} />

      {/* PWD Demographics */}
      <PWDDemographicsSection data={demographicsData} />

      {/* Youth Employment */}
      <YouthEmploymentSection data={demographicsData} />

      {/* Wage Employment */}
      <WageEmploymentSection data={demographicsData} />

      {/* Self Employment */}
      <SelfEmploymentSection data={demographicsData} />

      {/* Secondary Employment */}
      <SecondaryEmploymentSection data={demographicsData} />
    </div>
  );
}
