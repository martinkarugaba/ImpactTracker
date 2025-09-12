"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Users, DollarSign, PiggyBank, Calendar } from "lucide-react";
import { VSLA } from "../../types";
import { VSLABasicInfo } from "./vsla-basic-info";
import { VSLAFinancialOverview } from "./vsla-financial-overview";
import { VSLAAffiliations } from "./vsla-affiliations";
import { VSLALocationDetails } from "./vsla-location-details";
import { VSLAMeetingInfo } from "./vsla-meeting-info";
import { VSLAMembersManagement } from "../members";
import { VSLALoansTab } from "./vsla-loans-tab";
import { VSLASavingsTab } from "./vsla-savings-tab";
import { VSLAMeetingsTab } from "./vsla-meetings-tab";

interface VSLADetailsTabsProps {
  vsla: VSLA;
}

export function VSLADetailsTabs({ vsla }: VSLADetailsTabsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="details"
            className="flex items-center gap-2 data-[state=active]:text-blue-600"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex items-center gap-2 data-[state=active]:text-green-600"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="flex items-center gap-2 data-[state=active]:text-red-600"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Loans</span>
          </TabsTrigger>
          <TabsTrigger
            value="savings"
            className="flex items-center gap-2 data-[state=active]:text-emerald-600"
          >
            <PiggyBank className="h-4 w-4" />
            <span className="hidden sm:inline">Savings</span>
          </TabsTrigger>
          <TabsTrigger
            value="meetings"
            className="flex items-center gap-2 data-[state=active]:text-purple-600"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Meetings</span>
          </TabsTrigger>
        </TabsList>

        {/* Details Tab Content */}
        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6">
            {/* Basic Information Card */}
            <VSLABasicInfo vsla={vsla} />

            {/* Financial Overview Card */}
            <VSLAFinancialOverview vsla={vsla} />

            {/* Organization & Location Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <VSLAAffiliations vsla={vsla} />
              <VSLALocationDetails vsla={vsla} />
            </div>

            {/* Meeting Information Card */}
            <VSLAMeetingInfo vsla={vsla} />
          </div>
        </TabsContent>

        {/* Members Tab Content */}
        <TabsContent value="members" className="mt-6">
          <VSLAMembersManagement vsla={vsla} />
        </TabsContent>

        {/* Loans Tab Content */}
        <TabsContent value="loans" className="mt-6">
          <VSLALoansTab vsla={vsla} />
        </TabsContent>

        {/* Savings Tab Content */}
        <TabsContent value="savings" className="mt-6">
          <VSLASavingsTab vsla={vsla} />
        </TabsContent>

        {/* Meetings Tab Content */}
        <TabsContent value="meetings" className="mt-6">
          <VSLAMeetingsTab vsla={vsla} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
